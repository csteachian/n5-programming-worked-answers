/*
 * Flowchart renderer.
 *
 * A flowchart is described as a list of nodes. Simple nodes are drawn as a
 * single symbol; structured nodes (if / while / for / repeat) contain lists
 * of nodes of their own. Each node is laid out as a block with an entry point
 * at its top centre and an exit point at its bottom centre, so blocks can be
 * stacked in sequence and nested inside each other.
 *
 * Node types:
 *   { t: 'start' | 'end', text }
 *   { t: 'process' | 'io', text }
 *   { t: 'if', cond, then: [...], else: [...] }
 *   { t: 'while', cond, body: [...] }          test at the top
 *   { t: 'for', text, body: [...] }            fixed loop (hexagon symbol)
 *   { t: 'repeat', body: [...], cond }         test at the bottom (until)
 */
(function () {
  'use strict';

  const CHAR_W = 7.4;     // approximate width of one character at 13px
  const LINE_H = 16;      // line height for symbol text
  const GAP = 26;         // vertical gap between symbols (arrow length)
  const SIDE = 28;        // horizontal clearance for loop and branch lines
  const SKEW = 14;        // slant of input/output parallelograms

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function wrap(text, max) {
    const words = String(text).split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
      if (line && (line + ' ' + word).length > max) {
        lines.push(line);
        line = word;
      } else {
        line = line ? line + ' ' + word : word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function textWidth(lines) {
    return Math.max(...lines.map(l => l.length)) * CHAR_W;
  }

  function drawText(lines, cx, cy, cls) {
    const top = cy - ((lines.length - 1) * LINE_H) / 2;
    const spans = lines.map((l, i) =>
      `<tspan x="${cx}" y="${top + i * LINE_H}">${esc(l)}</tspan>`).join('');
    return `<text class="${cls || 'fc-text'}" text-anchor="middle" dominant-baseline="central">${spans}</text>`;
  }

  function path(points, arrow, ctx) {
    const d = points.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
    const marker = arrow ? ` marker-end="url(#${ctx.marker})"` : '';
    return `<path class="fc-line" d="${d}"${marker}/>`;
  }

  function label(text, x, y, anchor) {
    return `<text class="fc-label" x="${x}" y="${y}" text-anchor="${anchor || 'middle'}">${esc(text)}</text>`;
  }

  function dot(x, y) {
    return `<circle class="fc-dot" cx="${x}" cy="${y}" r="3"/>`;
  }

  /* ---------- Symbols ---------- */

  function symbol(kind, text) {
    const maxChars = kind === 'decision' ? 22 : kind === 'loop' ? 22 : 24;
    const lines = wrap(text, maxChars);
    const tw = textWidth(lines);
    const th = lines.length * LINE_H;
    let w, h;
    switch (kind) {
      case 'terminator':
        w = Math.max(110, tw + 44); h = Math.max(40, th + 18); break;
      case 'io':
        w = Math.max(150, tw + 32 + SKEW * 2); h = Math.max(42, th + 20); break;
      case 'decision':
        w = Math.max(130, tw * 1.6 + 44); h = Math.max(58, th * 2.4 + 24); break;
      case 'loop':
        w = Math.max(160, tw + 56); h = Math.max(44, th + 22); break;
      default:
        w = Math.max(150, tw + 32); h = Math.max(42, th + 20);
    }
    w = Math.round(w); h = Math.round(h);
    return {
      w, h, left: w / 2, right: w / 2, entry: 0,
      draw(cx, y) {
        const l = cx - w / 2, r = cx + w / 2, b = y + h, m = y + h / 2;
        let shape;
        switch (kind) {
          case 'terminator':
            shape = `<rect class="fc-shape fc-term" x="${l}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/>`; break;
          case 'io':
            shape = `<polygon class="fc-shape fc-io" points="${l + SKEW},${y} ${r},${y} ${r - SKEW},${b} ${l},${b}"/>`; break;
          case 'decision':
            shape = `<polygon class="fc-shape fc-dec" points="${cx},${y} ${r},${m} ${cx},${b} ${l},${m}"/>`; break;
          case 'loop':
            shape = `<polygon class="fc-shape fc-loop" points="${l + 14},${y} ${r - 14},${y} ${r},${m} ${r - 14},${b} ${l + 14},${b} ${l},${m}"/>`; break;
          default:
            shape = `<rect class="fc-shape fc-proc" x="${l}" y="${y}" width="${w}" height="${h}"/>`;
        }
        return shape + drawText(lines, cx, m);
      }
    };
  }

  /* ---------- Layout ---------- */

  function layout(node) {
    switch (node.t) {
      case 'start':
      case 'end': return symbol('terminator', node.text || (node.t === 'start' ? 'Start' : 'End'));
      case 'io': return symbol('io', node.text);
      case 'process': return symbol('process', node.text);
      case 'if': return layoutIf(node);
      case 'while': return layoutWhile(node, symbol('decision', node.cond), 'Yes', 'No');
      case 'for': return layoutWhile(node, symbol('loop', node.text), '', 'Done');
      case 'repeat': return layoutRepeat(node);
      default: throw new Error('Unknown flowchart node: ' + node.t);
    }
  }

  function sequence(nodes, ctx) {
    const blocks = (nodes || []).map(layout);
    let h = 0;
    blocks.forEach((b, i) => { h += b.h + (i ? GAP : 0); });
    return {
      h,
      left: Math.max(0, ...blocks.map(b => b.left)),
      right: Math.max(0, ...blocks.map(b => b.right)),
      entry: blocks.length ? blocks[0].entry : 0,
      empty: blocks.length === 0,
      draw(cx, y, c) {
        let out = '';
        let cy = y;
        blocks.forEach((b, i) => {
          if (i) {
            out += path([[cx, cy], [cx, cy + GAP + b.entry]], true, c);
            cy += GAP;
          }
          out += b.draw(cx, cy, c);
          cy += b.h;
        });
        return out;
      }
    };
  }

  function layoutIf(node) {
    const d = symbol('decision', node.cond);
    const yes = sequence(node.then);
    const no = sequence(node.else);
    const offL = Math.max(d.w / 2 + SIDE, yes.right + SIDE / 2);
    const offR = Math.max(d.w / 2 + SIDE, no.left + SIDE / 2);
    const branchTop = d.h + 18;
    const branchH = Math.max(yes.h, no.h);
    const merge = branchTop + branchH + 22;
    return {
      h: merge,
      left: offL + Math.max(yes.left, 0) + 6,
      right: offR + Math.max(no.right, 0) + 6,
      entry: 0,
      draw(cx, y, c) {
        const my = y + d.h / 2;
        const lx = cx - offL, rx = cx + offR, ym = y + merge;
        let out = d.draw(cx, y, c);
        [[yes, lx, -1, 'Yes'], [no, rx, 1, 'No']].forEach(([seq, bx, dir, word]) => {
          const vx = cx + dir * d.w / 2;
          out += label(word, vx + dir * 8, my - 7, dir < 0 ? 'end' : 'start');
          if (seq.empty) {
            out += path([[vx, my], [bx, my], [bx, ym], [cx, ym]], false, c);
          } else {
            out += path([[vx, my], [bx, my], [bx, y + branchTop + seq.entry]], true, c);
            out += seq.draw(bx, y + branchTop, c);
            out += path([[bx, y + branchTop + seq.h], [bx, ym], [cx, ym]], false, c);
          }
        });
        return out + dot(cx, ym);
      }
    };
  }

  function layoutWhile(node, test, yesWord, exitWord) {
    const body = sequence(node.body);
    const entry = 18;
    const bodyTop = entry + test.h + GAP;
    const loopY = bodyTop + body.h + 16;
    const exitY = loopY + 20;
    const loopX = Math.max(body.left, test.w / 2) + SIDE;
    const exitX = Math.max(body.right, test.w / 2) + SIDE;
    return {
      h: exitY,
      left: loopX + 6,
      right: exitX + 36,
      entry,
      draw(cx, y, c) {
        const joinY = y + 8;
        const ty = y + entry;
        const my = ty + test.h / 2;
        let out = '';
        out += path([[cx, y], [cx, ty]], false, c);
        out += test.draw(cx, ty, c);
        out += path([[cx, ty + test.h], [cx, y + bodyTop + body.entry]], true, c);
        if (yesWord) out += label(yesWord, cx + 6, ty + test.h + 14, 'start');
        out += body.draw(cx, y + bodyTop, c);
        // loop back to the test
        out += path([[cx, y + bodyTop + body.h], [cx, y + loopY], [cx - loopX, y + loopY],
          [cx - loopX, joinY], [cx - 4, joinY]], true, c);
        // exit when the test fails / loop finishes
        out += path([[cx + test.w / 2, my], [cx + exitX, my], [cx + exitX, y + exitY], [cx, y + exitY]], false, c);
        out += label(exitWord, cx + test.w / 2 + 8, my - 7, 'start');
        return out + dot(cx, joinY) + dot(cx, y + exitY);
      }
    };
  }

  function layoutRepeat(node) {
    const body = sequence(node.body);
    const test = symbol('decision', node.cond);
    const entry = 18;
    const testTop = entry + body.h + GAP;
    const loopX = Math.max(body.left, test.w / 2) + SIDE;
    return {
      h: testTop + test.h,
      left: loopX + 6,
      right: Math.max(body.right, test.w / 2) + 6,
      entry,
      draw(cx, y, c) {
        const joinY = y + 8;
        const ty = y + testTop;
        const my = ty + test.h / 2;
        let out = '';
        out += path([[cx, y], [cx, y + entry + body.entry]], !body.entry, c);
        out += body.draw(cx, y + entry, c);
        out += path([[cx, y + entry + body.h], [cx, ty]], true, c);
        out += test.draw(cx, ty, c);
        out += label('No', cx - test.w / 2 - 8, my - 7, 'end');
        out += path([[cx - test.w / 2, my], [cx - loopX, my], [cx - loopX, joinY], [cx - 4, joinY]], true, c);
        out += label('Yes', cx + 8, ty + test.h + 14, 'start');
        return out + dot(cx, joinY);
      }
    };
  }

  let uid = 0;

  function svgOpen(w, h, ctx, title) {
    return `<svg class="fc-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">` +
      `<defs><marker id="${ctx.marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">` +
      `<path class="fc-arrowhead" d="M0 0 L10 5 L0 10 z"/></marker></defs>`;
  }

  /** Render a full flowchart (Start ... End) to an SVG string. */
  function render(nodes, title) {
    const ctx = { marker: 'fc-arrow-' + (++uid) };
    const root = sequence(nodes);
    const pad = 14;
    const w = Math.ceil(root.left + root.right + pad * 2);
    const h = Math.ceil(root.h + pad * 2);
    const cx = pad + root.left;
    return svgOpen(w, h, ctx, title || 'Flowchart') + root.draw(cx, pad, ctx) + '</svg>';
  }

  /** Render one symbol on its own, for the key. */
  function renderSymbol(kind, text) {
    const ctx = { marker: 'fc-arrow-' + (++uid) };
    const s = symbol(kind, text);
    const pad = 3;
    return svgOpen(s.w + pad * 2, s.h + pad * 2, ctx, text) + s.draw(s.w / 2 + pad, pad, ctx) + '</svg>';
  }

  window.Flowchart = { render, renderSymbol };
})();
