window.ML = window.ML || {};

ML.UI = (function () {
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      var val = attrs[key];
      if (val === undefined || val === null || val === false) return;
      if (key === 'class') el.className = val;
      else if (key === 'text') el.textContent = val;
      else if (key.indexOf('on') === 0 && typeof val === 'function') el.addEventListener(key.slice(2).toLowerCase(), val);
      else if (key === 'disabled') { if (val) el.setAttribute('disabled', ''); }
      else el.setAttribute(key, val);
    });
    (children || []).forEach(function (child) {
      if (child === undefined || child === null || child === false) return;
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else el.appendChild(child);
    });
    return el;
  }

  function button(label, opts) {
    opts = opts || {};
    var cls = 'btn ' + (opts.variant === 'secondary' ? 'btn-secondary' : opts.variant === 'disabled' ? 'btn-disabled' : 'btn-primary');
    if (opts.className) cls += ' ' + opts.className;
    var attrs = { class: cls };
    if (opts.ariaLabel) attrs['aria-label'] = opts.ariaLabel;
    if (opts.href && opts.variant !== 'disabled') {
      attrs.href = opts.href;
      return h('a', Object.assign(attrs, { onclick: opts.onClick }), [label]);
    }
    if (opts.variant === 'disabled') attrs.disabled = true;
    else attrs.onclick = opts.onClick;
    return h('button', attrs, [label]);
  }

  function eyebrow(text) {
    return h('div', { class: 'eyebrow' }, [text]);
  }

  function heading(text) {
    return h('h1', { class: 'screen-h1' }, [text]);
  }

  function card(children, extraClass) {
    return h('div', { class: 'card' + (extraClass ? ' ' + extraClass : '') }, children);
  }

  function progressBar(label, step, total) {
    return h('div', { class: 'progress' }, [
      h('div', { class: 'progress-row' }, [
        h('span', {}, [label]),
        h('span', {}, ['Page ' + step + ' of ' + total])
      ]),
      h('div', { class: 'progress-track' }, [
        h('div', { class: 'progress-fill', style: 'width:' + (step / total * 100) + '%' })
      ])
    ]);
  }

  function scaleLabelsRow() {
    return h('div', { class: 'scale-header' }, [
      h('span', {}, ['All me']),
      h('span', {}, ['Roughly equal']),
      h('span', {}, ['Spouse'])
    ]);
  }

  function scale(opts) {
    var name = opts.name;
    var value = opts.value;
    var onPick = opts.onPick;
    var disabled = !!opts.disabled;
    var values = ML.SCALE.values;
    var buttons = [];

    var group = h('div', {
      class: 'scale' + (disabled ? ' scale-disabled' : ''),
      role: 'radiogroup',
      'aria-label': name
    }, []);

    function focusIndex(idx) {
      var btn = buttons[idx];
      if (btn) btn.focus();
    }

    group.addEventListener('keydown', function (e) {
      var idx = values.indexOf(value);
      if (idx === -1) idx = 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        var next = Math.min(values.length - 1, idx + 1);
        onPick(values[next]);
        setTimeout(function () { focusIndex(next); }, 0);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = Math.max(0, idx - 1);
        onPick(values[prev]);
        setTimeout(function () { focusIndex(prev); }, 0);
      } else if (e.key === 'Home') {
        e.preventDefault();
        onPick(values[0]);
        setTimeout(function () { focusIndex(0); }, 0);
      } else if (e.key === 'End') {
        e.preventDefault();
        onPick(values[values.length - 1]);
        setTimeout(function () { focusIndex(values.length - 1); }, 0);
      }
    });

    var track = h('div', { class: 'scale-track' });
    group.appendChild(track);

    values.forEach(function (n, i) {
      var sel = value === n;
      var label = name + ': ' + ML.SCALE.labels[String(n)];
      var dot = h('span', { class: 'scale-dot' + (sel ? ' scale-dot-selected' : ''), style: sel ? 'background:' + ML.SCALE.colors[String(n)] : '' });
      var stopLabel = sel ? h('span', { class: 'scale-stop-label', 'aria-hidden': 'true' }, [ML.SCALE.labels[String(n)]]) : null;
      var isCurrentTab = sel || (value === undefined && i === 0);
      var btn = h('button', {
        type: 'button',
        class: 'scale-stop',
        role: 'radio',
        'aria-checked': sel ? 'true' : 'false',
        'aria-label': label,
        tabindex: isCurrentTab ? '0' : '-1',
        disabled: disabled,
        onclick: function () { onPick(sel ? null : n); }
      }, [dot, stopLabel]);
      buttons.push(btn);
      group.appendChild(btn);
    });

    return group;
  }

  function toggleLink(label, active, onClick) {
    return h('button', {
      type: 'button',
      class: 'toggle-link' + (active ? ' toggle-link-active' : ''),
      'aria-pressed': active ? 'true' : 'false',
      onclick: onClick
    }, [label]);
  }

  function mosaicCell(value, name) {
    var base = 'mosaic-cell';
    var prefix = name ? name + ': ' : '';
    if (typeof value === 'number') {
      var k = String(value);
      return {
        node: h('div', { class: base, style: 'background:' + ML.SCALE.colors[k], role: 'img', 'aria-label': prefix + ML.SCALE.labels[k] }, []),
        label: ML.SCALE.labels[k]
      };
    }
    if (value === 'nobody') {
      return { node: h('div', { class: base + ' mosaic-cell-nobody', role: 'img', 'aria-label': prefix + 'Nobody' }, []), label: 'Nobody' };
    }
    if (value === 'out') {
      return { node: h('div', { class: base + ' mosaic-cell-out', role: 'img', 'aria-label': prefix + 'Someone else' }, []), label: 'Someone else' };
    }
    return { node: h('div', { class: base + ' mosaic-cell-blank', role: 'img', 'aria-label': prefix + 'Not placed' }, []), label: 'Not placed' };
  }

  function chip(text, tone) {
    return h('span', { class: 'chip chip-' + tone }, [text]);
  }

  function stageLabel(value) {
    if (typeof value === 'number') return ML.SCALE.labels[String(value)].toLowerCase();
    if (value === 'nobody') return 'nobody';
    if (value === 'out') return 'someone else';
    return 'not placed';
  }

  function rowDescription(cat, gut, detail) {
    var parts = ['Gut call: ' + stageLabel(gut)];
    ML.STAGES.forEach(function (s) {
      parts.push(ML.STAGE_TITLES[s] + ': ' + stageLabel(detail[s]));
    });
    return cat.name + '. ' + parts.join('. ') + '.';
  }

  function pos(v) { return ((v + 2) / 4) * 100; }

  function gapViz(gut, detail, widest) {
    var wrap = h('div', { class: 'gap-viz', role: 'presentation' });
    wrap.appendChild(h('div', { class: 'gap-viz-line' }));
    wrap.appendChild(h('div', { class: 'gap-viz-mid' }));

    if (widest) {
      var farVal = detail[widest];
      if (typeof farVal === 'number') {
        var left = Math.min(pos(gut), pos(farVal));
        var width = Math.abs(pos(farVal) - pos(gut));
        var dir = farVal - gut;
        var tone = dir < 0 ? 'more' : dir > 0 ? 'less' : 'ok';
        wrap.appendChild(h('div', { class: 'gap-viz-span gap-viz-span-' + tone, style: 'left:' + left + '%;width:' + width + '%' }));
      }
    }

    wrap.appendChild(h('div', { class: 'gap-viz-gut', style: 'left:' + pos(gut) + '%' }));

    var dotTop = { c: 2, p: 21, e: 40 };
    ML.STAGES.forEach(function (s) {
      var v = detail[s];
      if (typeof v !== 'number') return;
      wrap.appendChild(h('span', {
        class: 'gap-viz-dot',
        style: 'left:' + pos(v) + '%;top:' + dotTop[s] + 'px'
      }, [s.toUpperCase()]));
    });

    return wrap;
  }

  return {
    h: h, button: button, eyebrow: eyebrow, heading: heading, card: card,
    progressBar: progressBar, scaleLabelsRow: scaleLabelsRow, scale: scale,
    toggleLink: toggleLink, mosaicCell: mosaicCell, chip: chip, stageLabel: stageLabel,
    rowDescription: rowDescription, gapViz: gapViz, pos: pos
  };
})();
