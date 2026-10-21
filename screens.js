window.ML = window.ML || {};

ML.Screens = (function () {
  var h = ML.UI.h;

  function startOverControl(variant) {
    var wrap = h('div', { class: 'start-over start-over-' + variant });
    function renderLink() {
      wrap.innerHTML = '';
      wrap.appendChild(h('button', { type: 'button', class: 'start-over-link', onclick: renderConfirm }, ['Start over']));
    }
    function renderConfirm() {
      wrap.innerHTML = '';
      wrap.appendChild(h('span', { class: 'start-over-confirm' }, [
        h('span', { class: 'start-over-text' }, ['Clear everything?']),
        h('button', { type: 'button', class: 'start-over-yes', onclick: function () { ML.App.hardReset(); } }, ['Yes']),
        h('button', { type: 'button', class: 'start-over-no', onclick: renderLink }, ['Cancel'])
      ]));
    }
    renderLink();
    return wrap;
  }

  function shell(className, inner, opts) {
    opts = opts || {};
    var top = opts.hideStartOver ? null : startOverControl('corner');
    var children = top ? [top].concat(inner) : inner;
    return h('div', { class: 'screen ' + className }, [h('div', { class: 'screen-inner' }, children)]);
  }

  function gutQuestionText(cat, gut) {
    var phrase = gut === -2 ? 'is all you' : gut === -1 ? 'is mostly you' : gut === 0 ? 'is equal' :
      gut === 1 ? 'is mostly your spouse' : 'is all your spouse';
    return 'You said ' + cat.name + ' ' + phrase + '. Is it?';
  }

  function gutStandouts(state) {
    var withGut = ML.Cats.activeCategories(state).filter(function (c) { return typeof state.gut[c.id] === 'number'; });
    var self = null, spouse = null;
    withGut.forEach(function (c) {
      var v = state.gut[c.id];
      if (v <= -1 && (!self || v < state.gut[self.id])) self = c;
      if (v >= 1 && (!spouse || v > state.gut[spouse.id])) spouse = c;
    });
    return { self: self, spouse: spouse };
  }

  function gutStandoutText(state) {
    var s = gutStandouts(state);
    var parts = [];
    if (s.self) parts.push('You look to be carrying more on ' + s.self.name + '.');
    if (s.spouse) parts.push('Your spouse seems to be carrying more on ' + s.spouse.name + '.');
    return parts.join(' ');
  }

  function verdictText(v) {
    return v === 'more' ? 'You carry more than you said' : v === 'less' ? 'You carry less than you said' : 'Roughly right';
  }

  function surpriseLine(a) {
    var stageBits = ML.STAGES.filter(function (s) { return typeof a.detail[s] === 'number'; })
      .map(function (s) { return ML.STAGE_TITLES[s] + ' ' + ML.SCALE.labels[String(a.detail[s])].toLowerCase(); });
    return h('div', { class: 'line-item' }, [
      h('span', { class: 'line-item-name' }, [a.cat.name + '.']),
      ' You said "' + ML.SCALE.labels[String(a.gut)] + '". Closer look: ' + stageBits.join(', ') + '.'
    ]);
  }

  function thankYouSentence(a) {
    var stageBits = ML.STAGES.filter(function (s) { return typeof a.detail[s] === 'number'; })
      .map(function (s) { return ML.STAGE_TITLES[s] + ' ' + ML.SCALE.labels[String(a.detail[s])].toLowerCase(); });
    return h('div', { class: 'line-item' }, [
      h('span', { class: 'line-item-name' }, [a.cat.name + '.']),
      ' You said "' + ML.SCALE.labels[String(a.gut)] + '". Closer look: ' + stageBits.join(', ') + '.'
    ]);
  }

  function balanceCopy(b) {
    if (b.tier === 'none') {
      return { title: 'Not enough closer looks yet', body: 'Open a few more categories to see how the noticing is split.', ask: '' };
    }
    if (b.tier === 'heavy') {
      return {
        title: 'A lot of the noticing is yours',
        body: 'In ' + b.num + ' of ' + b.den + ' categories, you are the one who notices that something needs doing. That is real work even when it doesn’t show.',
        ask: 'Is that a load you want to keep? One thing to try: hand over the noticing in one category, not just the doing.'
      };
    }
    if (b.tier === 'light') {
      return {
        title: 'Most of the noticing is your spouse’s',
        body: 'In ' + b.num + ' of ' + b.den + ' categories, your spouse is the one who notices what needs doing. Doing it is only part of the load.',
        ask: 'Is this the right balance for you and your family? One thing to try: pick up the noticing in one category.'
      };
    }
    return {
      title: 'The noticing is split between you',
      body: 'In ' + b.num + ' of ' + b.den + ' categories, you are the one who notices what needs doing. In the rest, it’s shared or your spouse’s call.',
      ask: 'The noticing is spread between you. Does the split feel right?'
    };
  }

  function scaleCard(opts) {
    var dim = opts.dimmed;
    return h('section', { class: 'q-card' }, [
      h('div', { class: 'q-card-head' }, [
        h('div', { class: 'q-card-title' }, [opts.title]),
        h('div', { class: 'q-card-toggles-inline' }, opts.toggles)
      ]),
      h('div', { class: 'q-card-ask' }, [opts.ask]),
      h('div', { class: 'q-card-scale' + (dim ? ' q-card-scale-dim' : '') }, [
        ML.UI.scale({ name: opts.title, value: typeof opts.value === 'number' ? opts.value : undefined, onPick: opts.onPick, disabled: false })
      ])
    ]);
  }

  function screenWelcome(state) {
    var gets = [
      { n: '1', title: 'A picture of what you carry', body: 'Ten parts of home life on one map.' },
      { n: '2', title: 'A test of your gut', body: 'See where your instinct about your own home was right, and where it wasn’t.' }
    ];
    return shell('screen-narrow', [
      h('div', { class: 'stack-sm' }, [
        ML.UI.eyebrow('Household mental load check'),
        ML.UI.heading('See what you actually carry at home.')
      ]),
      h('div', { class: 'stack-md' }, [
        h('div', { class: 'section-title' }, ['What you get']),
        h('div', { class: 'stack-sm' }, gets.map(function (g) {
          return h('div', { class: 'get-item' }, [
            h('span', { class: 'get-num' }, [g.n]),
            h('div', {}, [h('div', { class: 'get-title' }, [g.title]), h('div', { class: 'get-body' }, [g.body])])
          ]);
        }))
      ]),
      h('div', { class: 'stack-xs cta-block' }, [
        ML.UI.button('Start', { onClick: function (e) { e.preventDefault(); ML.App.go('gut', { gutPage: 0 }); } }),
        h('div', { class: 'fine-print' }, ['About 5 minutes. Nothing is shared unless you choose to.'])
      ])
    ]);
  }

  function screenGut(state) {
    var pageIdx = state.progress.gutPage || 0;
    var page = ML.GUT_PAGES[pageIdx];
    var rows = page.ids.map(function (id) {
      var cat = ML.Cats.getCategory(id);
      var v = state.gut[id];
      var isSkip = v === 'skip';
      var numVal = typeof v === 'number' ? v : undefined;
      return h('section', { class: 'q-card' }, [
        h('div', { class: 'q-card-head' }, [
          h('div', { class: 'q-card-title' }, [cat.name]),
          h('div', { class: 'q-card-toggles-inline' }, [
            ML.UI.toggleLink('We don’t do this', isSkip, function () {
              ML.App.update(function (s) { s.gut[id] = isSkip ? undefined : 'skip'; });
            })
          ])
        ]),
        h('div', { class: 'q-card-ask' }, [cat.short]),
        h('div', { class: 'q-card-scale' + (isSkip ? ' q-card-scale-dim' : '') }, [
          ML.UI.scale({
            name: cat.name, value: numVal,
            onPick: function (n) { ML.App.update(function (s) { s.gut[id] = (n === null ? undefined : n); }); }
          })
        ])
      ]);
    });
    var done = page.ids.every(function (id) { return state.gut[id] !== undefined; });
    var isLast = pageIdx === ML.GUT_PAGES.length - 1;

    var footer;
    if (!done) {
      footer = ML.UI.button('Answer each one to continue', { variant: 'disabled' });
    } else if (isLast) {
      footer = ML.UI.button('See my gut picture', { onClick: function (e) { e.preventDefault(); ML.App.go('gutResult'); } });
    } else {
      footer = ML.UI.button('Next', { onClick: function (e) { e.preventDefault(); ML.App.go('gut', { gutPage: pageIdx + 1 }); } });
    }
    var back = ML.UI.button('Back', {
      variant: 'secondary', className: 'btn-fixed',
      onClick: function (e) {
        e.preventDefault();
        if (pageIdx > 0) ML.App.go('gut', { gutPage: pageIdx - 1 });
        else ML.App.go('welcome');
      }
    });

    return shell('screen-narrow', [
      ML.UI.progressBar('Gut call', pageIdx + 1, ML.GUT_PAGES.length),
      h('div', { class: 'stack-xs' }, [
        ML.UI.heading(page.title),
        h('p', { class: 'lede' }, ['How much of this do you handle? Go with your gut.'])
      ]),
      ML.UI.scaleLabelsRow(),
      h('div', { class: 'stack-sm' }, rows),
      h('div', { class: 'footer-row' }, [back, footer])
    ], { hideStartOver: true });
  }

  function stripRow(cat, state) {
    var v = state.gut[cat.id];
    var label = cat.name + ': ' + ML.SCALE.labels[String(v)];
    return h('div', { class: 'strip-row' }, [
      h('div', { class: 'strip-name' }, [cat.name]),
      h('div', { class: 'strip-track', role: 'img', 'aria-label': label }, [
        h('div', { class: 'strip-line' }),
        h('div', { class: 'strip-mid' }),
        h('div', { class: 'strip-tick', style: 'left:' + ML.UI.pos(v) + '%' })
      ])
    ]);
  }

  function screenGutResult(state) {
    var active = ML.Cats.activeCategories(state);
    var leadCat = ML.Cats.leadCategory(state);
    var leadGut = state.gut[leadCat.id];
    var standoutText = gutStandoutText(state);
    var groups = ML.GROUP_ORDER.map(function (g) {
      return { group: g, cats: active.filter(function (c) { return c.group === g; }) };
    }).filter(function (g) { return g.cats.length; });

    var groupBlocks = groups.map(function (g) {
      return h('div', { class: 'theme-group' }, [
        h('div', { class: 'theme-label' }, [ML.GROUP_TITLES[g.group]]),
        h('div', { class: 'theme-rows' }, g.cats.map(function (cat) { return stripRow(cat, state); }))
      ]);
    });

    return shell('screen-narrow', [
      h('div', { class: 'stack-xs' }, [
        h('div', { class: 'eyebrow-row' }, [ML.UI.eyebrow('Your gut picture'), startOverControl('corner')]),
        ML.UI.heading('Here’s how it feels from where you stand.'),
        standoutText ? h('p', { class: 'lede' }, [standoutText]) : null
      ]),
      ML.UI.card([
        h('div', { class: 'theme-group theme-header' }, [
          h('div', { class: 'theme-label' }, []),
          h('div', { class: 'strip-header' }, [h('span', {}, ['All me']), h('span', {}, ['Roughly equal']), h('span', {}, ['Spouse'])])
        ]),
        h('div', { class: 'theme-group-list' }, groupBlocks)
      ]),
      h('div', { class: 'footer-row' }, [
        ML.UI.button('Back', { variant: 'secondary', className: 'btn-fixed', onClick: function (e) { e.preventDefault(); ML.App.go('gut', { gutPage: ML.GUT_PAGES.length - 1 }); } })
      ]),
      h('div', { class: 'callout-block cta-block' }, [
        h('div', { class: 'callout-eyebrow' }, ['A question worth asking']),
        h('div', { class: 'callout-title' }, [gutQuestionText(leadCat, leadGut)]),
        ML.UI.button('Find out', { variant: 'onDark', className: 'btn-on-dark', onClick: function (e) { e.preventDefault(); ML.App.go('explainer'); } })
      ])
    ], { hideStartOver: true });
  }

  function screenExplainer(state) {
    var leadCat = ML.Cats.leadCategory(state);
    var parts = [
      { letter: 'C', title: 'Conceive', body: 'Noticing it needs doing.', example: 'Spotting that the dentist visit is overdue.' },
      { letter: 'P', title: 'Plan', body: 'Deciding how, when and who.', example: 'Finding a time that works and booking it.' },
      { letter: 'E', title: 'Execute', body: 'Actually doing it.', example: 'Taking the child to the appointment.' }
    ];
    return shell('screen-narrow', [
      h('div', { class: 'stack-xs' }, [
        ML.UI.eyebrow('Before you look closer'),
        ML.UI.heading('Every household thing has three parts.')
      ]),
      h('div', { class: 'stack-sm' }, parts.map(function (p) {
        return h('div', { class: 'part-card' }, [
          h('span', { class: 'part-letter' }, [p.letter]),
          h('div', {}, [
            h('div', { class: 'part-title' }, [p.title]),
            h('div', { class: 'part-body' }, [p.body]),
            h('div', { class: 'part-example' }, [p.example])
          ])
        ]);
      })),
      h('p', { class: 'lede' }, ['One person can do all three, or each part can land on someone different. Your gut call blends them together, so now we’ll ask about each part.']),
      h('div', { class: 'footer-row' }, [
        ML.UI.button('Back', { variant: 'secondary', className: 'btn-fixed', onClick: function (e) { e.preventDefault(); ML.App.go('gutResult'); } }),
        ML.UI.button('Look closer at ' + leadCat.name, {
          onClick: function (e) {
            e.preventDefault();
            ML.App.update(function (s) { s.detail[leadCat.id] = s.detail[leadCat.id] || {}; });
            ML.App.go('closerLook', { activeCategory: leadCat.id, explainerSeen: true });
          }
        })
      ])
    ], { hideStartOver: true });
  }

  function screenCloserLook(state) {
    var cat = ML.Cats.getCategory(state.progress.activeCategory) || ML.Cats.leadCategory(state);
    var detail = state.detail[cat.id] || {};
    var defs = ['c', 'p', 'e'];
    var rows = defs.map(function (s) {
      var v = detail[s];
      var stage = cat.stages[s];
      var isNobody = v === 'nobody';
      var isOut = v === 'out';
      var numVal = typeof v === 'number' ? v : undefined;
      var toggles = [
        ML.UI.toggleLink('Nobody does this', isNobody, function () {
          ML.App.update(function (st) {
            st.detail[cat.id] = st.detail[cat.id] || {};
            st.detail[cat.id][s] = isNobody ? undefined : 'nobody';
          });
        })
      ];
      if (s === 'e') {
        toggles.push(ML.UI.toggleLink('Someone else does the doing', isOut, function () {
          ML.App.update(function (st) {
            st.detail[cat.id] = st.detail[cat.id] || {};
            st.detail[cat.id][s] = isOut ? undefined : 'out';
          });
        }));
      }
      return scaleCard({
        title: stage.title,
        ask: stage.question,
        value: numVal,
        dimmed: isNobody || isOut,
        onPick: function (n) {
          ML.App.update(function (st) {
            st.detail[cat.id] = st.detail[cat.id] || {};
            st.detail[cat.id][s] = (n === null ? undefined : n);
          });
        },
        toggles: toggles
      });
    });
    var done = defs.every(function (s) { return detail[s] !== undefined; });
    var remainingOthers = ML.Cats.unopenedActiveCategories(state).filter(function (c) { return c.id !== cat.id; });
    var footer = done
      ? ML.UI.button(remainingOthers.length ? 'Next' : 'See your result', {
        onClick: function (e) {
          e.preventDefault();
          ML.App.update(function (s) { if (s.opened.indexOf(cat.id) === -1) s.opened.push(cat.id); });
          var next = ML.Cats.pickNextOrder(state)[0];
          if (next) {
            ML.App.update(function (s) { s.detail[next.id] = s.detail[next.id] || {}; });
            ML.App.go('closerLook', { activeCategory: next.id });
          } else {
            ML.App.go('result');
          }
        }
      })
      : ML.UI.button('Answer all three to continue', { variant: 'disabled' });
    var back = ML.UI.button('Back', { variant: 'secondary', className: 'btn-fixed', onClick: function (e) { e.preventDefault(); ML.App.go('pickNext'); } });

    return shell('screen-narrow', [
      ML.UI.eyebrow('Closer look'),
      h('div', { class: 'stack-xs' }, [
        ML.UI.heading(cat.name),
        h('p', { class: 'lede' }, ['Think of a normal week. For each part, who does it?'])
      ]),
      ML.UI.scaleLabelsRow(),
      h('div', { class: 'stack-sm' }, rows),
      h('div', { class: 'footer-row' }, [back, footer])
    ], { hideStartOver: true });
  }

  function screenPickNext(state) {
    var order = ML.Cats.pickNextOrder(state);
    var list = order.map(function (cat) {
      var v = state.gut[cat.id];
      var label = ML.SCALE.labels[String(v)];
      return h('button', {
        type: 'button', class: 'pick-card',
        onclick: function () {
          ML.App.update(function (s) { s.detail[cat.id] = s.detail[cat.id] || {}; });
          ML.App.go('closerLook', { activeCategory: cat.id });
        }
      }, [
        h('div', {}, [
          h('div', { class: 'pick-card-name' }, [cat.name]),
          h('div', { class: 'pick-card-short' }, [cat.short])
        ]),
        h('span', { class: 'pill', style: 'background:' + ML.SCALE.colors[String(v)] + ';color:' + ML.SCALE.textOn[String(v)] }, [label])
      ]);
    });
    var allDone = order.length === 0;
    var resultBtn = allDone
      ? ML.UI.button('See my result', { onClick: function (e) { e.preventDefault(); ML.App.go('result'); } })
      : ML.UI.button('Look closer at the rest to see your result', { variant: 'disabled' });

    var listOrEmpty = order.length
      ? h('div', { class: 'stack-xs' }, list)
      : h('p', { class: 'lede' }, ['You’ve looked closer at every category you rated.']);

    return shell('screen-narrow', [
      h('div', { class: 'stack-xs' }, [
        ML.UI.eyebrow('Pick next'),
        ML.UI.heading('What do you want to look at next?')
      ]),
      listOrEmpty,
      h('div', { class: 'footer-row' }, [
        ML.UI.button('Back', { variant: 'secondary', className: 'btn-fixed', onClick: function (e) { e.preventDefault(); ML.App.go('gutResult'); } }),
        resultBtn
      ])
    ], { hideStartOver: true });
  }

  function selfScore(cat, state) {
    if (ML.Cats.isOpened(state, cat.id)) {
      var avg = ML.Scoring.detailAverage(state.detail[cat.id] || {});
      if (avg !== null) return avg;
    }
    return state.gut[cat.id];
  }

  function stageConclusion(state) {
    var analyzed = ML.Scoring.allAnalyzed(state);
    if (!analyzed.length) return null;
    var sums = { c: 0, p: 0, e: 0 }, counts = { c: 0, p: 0, e: 0 };
    analyzed.forEach(function (a) {
      ML.STAGES.forEach(function (s) {
        var v = a.detail[s];
        if (typeof v === 'number') { sums[s] += v; counts[s]++; }
      });
    });
    var withData = ML.STAGES.filter(function (s) { return counts[s] > 0; });
    if (!withData.length) return null;
    var avgs = {};
    withData.forEach(function (s) { avgs[s] = sums[s] / counts[s]; });
    var lowest = withData.reduce(function (a, b) { return avgs[a] <= avgs[b] ? a : b; });
    var highest = withData.reduce(function (a, b) { return avgs[a] >= avgs[b] ? a : b; });
    if (avgs[highest] - avgs[lowest] < 0.5) return 'Across what you’ve opened, you carry Conceive, Plan and Execute about equally.';
    return 'Across what you’ve opened, you carry the most at ' + ML.STAGE_TITLES[lowest] + ' and the least at ' + ML.STAGE_TITLES[highest] + '.';
  }

  function themeLoadConclusion(state) {
    var active = ML.Cats.activeCategories(state);
    function groupAvg(groups) {
      var nums = active.filter(function (c) { return groups.indexOf(c.group) !== -1; })
        .map(function (c) { return selfScore(c, state); })
        .filter(function (v) { return typeof v === 'number'; });
      if (!nums.length) return null;
      return nums.reduce(function (a, b) { return a + b; }, 0) / nums.length;
    }
    var house = groupAvg(['house']);
    var rest = groupAvg(['kids', 'family']);
    if (house === null || rest === null) return null;
    var diff = house - rest;
    if (Math.abs(diff) < 0.4) return 'It’s split evenly between around the house and the kids and family combined.';
    return diff < 0
      ? 'You carry more around the house than you do for the kids and family combined.'
      : 'You carry more for the kids and family combined than you do around the house.';
  }

  function screenResult(state) {
    var active = ML.Cats.activeCategories(state);
    var legendVals = [-2, -1, 0, 1, 2];
    var legend = legendVals.map(function (n) {
      return h('div', { class: 'legend-item' }, [h('span', { class: 'legend-swatch', style: 'background:' + ML.SCALE.colors[String(n)] }), ML.SCALE.labels[String(n)]]);
    }).concat([
      h('div', { class: 'legend-item' }, [h('span', { class: 'legend-swatch legend-swatch-nobody' }), 'Nobody']),
      h('div', { class: 'legend-item' }, [h('span', { class: 'legend-swatch legend-swatch-blank' }), 'Not placed'])
    ]);

    function mosaicRow(cat) {
      var detail = ML.Cats.isOpened(state, cat.id) ? (state.detail[cat.id] || {}) : {};
      var cCell = ML.UI.mosaicCell(detail.c, cat.name + ' · Conceive');
      var pCell = ML.UI.mosaicCell(detail.p, cat.name + ' · Plan');
      var eCell = ML.UI.mosaicCell(detail.e, cat.name + ' · Execute');
      return h('div', { class: 'mosaic-row' }, [
        h('div', { class: 'mosaic-row-name' }, [cat.name]),
        h('div', { class: 'cells' }, [cCell.node, pCell.node, eCell.node])
      ]);
    }

    var groups = ML.GROUP_ORDER.map(function (g) {
      return { group: g, cats: active.filter(function (c) { return c.group === g; }) };
    }).filter(function (g) { return g.cats.length; });

    var groupBlocks = groups.map(function (g) {
      return h('div', { class: 'theme-group' }, [
        h('div', { class: 'theme-label' }, [ML.GROUP_TITLES[g.group]]),
        h('div', { class: 'theme-rows' }, g.cats.map(mosaicRow))
      ]);
    });

    var conclusionLines = [stageConclusion(state), themeLoadConclusion(state)].filter(Boolean);

    return shell('screen-wide', [
      ML.UI.progressBar('Result', 1, 3),
      h('div', { class: 'stack-xs' }, [
        ML.UI.eyebrow('Result'),
        ML.UI.heading('What do I carry?'),
        h('p', { class: 'lede' }, ['Grouped by theme, in category order. No totals, no percentages.'])
      ]),
      conclusionLines.length
        ? ML.UI.card([
          h('div', { class: 'section-title' }, ['The big picture']),
          h('div', { class: 'stack-xs' }, conclusionLines.map(function (line) { return h('p', { class: 'lede' }, [line]); }))
        ])
        : null,
      h('div', { class: 'legend' }, legend),
      h('div', { class: 'theme-group-list' }, groupBlocks),

      h('div', { class: 'footer-row' }, [
        ML.UI.button('Back', { variant: 'secondary', className: 'btn-fixed', onClick: function (e) { e.preventDefault(); ML.App.go('pickNext'); } }),
        ML.UI.button('Next', { onClick: function (e) { e.preventDefault(); ML.App.go('resultGap'); } })
      ])
    ]);
  }

  function screenResultGap(state) {
    var active = ML.Cats.activeCategories(state);
    var analyzed = active
      .filter(function (cat) { return ML.Cats.isOpened(state, cat.id); })
      .map(function (cat) { return ML.Scoring.analyzeCategory(cat, state); })
      .filter(Boolean);

    var gapRows = analyzed.map(function (a) {
      return h('div', { class: 'gap-row' }, [
        h('div', { class: 'gap-row-name' }, [a.cat.name]),
        h('div', { class: 'gap-row-viz' }, [
          ML.UI.gapViz(a.gut, a.detail, a.widest),
          h('span', { class: 'sr-only' }, [ML.UI.rowDescription(a.cat, a.gut, a.detail)])
        ]),
        h('div', { class: 'gap-row-verdict' }, [
          ML.UI.chip(verdictText(a.verdict), a.verdict)
        ])
      ]);
    });

    return shell('screen-wide', [
      ML.UI.progressBar('Result', 2, 3),
      h('div', { class: 'stack-xs' }, [
        ML.UI.eyebrow('Result'),
        ML.UI.heading('Where was my gut off?'),
        h('p', { class: 'lede' }, ['Your first call against what your closer look says. The line is the gap.'])
      ]),
      gapRows.length
        ? h('div', { class: 'stack-sm' }, gapRows)
        : h('p', { class: 'lede' }, ['Open a closer look to see this comparison.']),

      h('div', { class: 'footer-row' }, [
        ML.UI.button('Back', { variant: 'secondary', className: 'btn-fixed', onClick: function (e) { e.preventDefault(); ML.App.go('result'); } }),
        ML.UI.button('Next', { onClick: function (e) { e.preventDefault(); ML.App.go('resultSurprises'); } })
      ])
    ]);
  }

  function screenResultSurprises(state) {
    var surprises = ML.Scoring.topSurprises(state, 3);
    var wellKnown = ML.Scoring.bestGuesses(state, 3);

    return shell('screen-wide', [
      ML.UI.progressBar('Result', 3, 3),
      h('div', { class: 'stack-xs' }, [
        ML.UI.eyebrow('Result'),
        ML.UI.heading('Your three biggest surprises'),
        h('p', { class: 'lede' }, ['Where your gut and your closer look differed most — and where you knew yourself best.'])
      ]),
      h('div', { class: 'result-grid' }, [
        ML.UI.card([
          h('div', { class: 'section-title' }, ['Biggest surprises']),
          surprises.length
            ? h('div', { class: 'stack-xs' }, surprises.map(surpriseLine))
            : h('p', { class: 'lede' }, ['Nothing surprising yet — your gut and your closer look agree so far.'])
        ]),
        ML.UI.card([
          h('div', { class: 'section-title' }, ['Where you knew yourself well']),
          wellKnown.length
            ? h('div', { class: 'stack-xs' }, wellKnown.map(surpriseLine))
            : h('p', { class: 'lede' }, ['Open a few more categories to see where your gut nailed it.'])
        ])
      ]),

      h('div', { class: 'footer-row' }, [
        ML.UI.button('Back', { variant: 'secondary', className: 'btn-fixed', onClick: function (e) { e.preventDefault(); ML.App.go('resultGap'); } }),
        ML.UI.button('See what to do next', { onClick: function (e) { e.preventDefault(); ML.App.go('whatNow'); } })
      ])
    ]);
  }

  function screenWhatNow(state) {
    var thankYou = ML.Scoring.thankYouList(state, 3);
    var balance = ML.Scoring.balanceCheck(state);
    var copy = balanceCopy(balance);

    return shell('screen-wide', [
      h('div', { class: 'stack-xs' }, [
        ML.UI.heading('What to do with this'),
        h('p', { class: 'lede' }, ['Three things, in this order.'])
      ]),
      h('section', { class: 'card' }, [
        h('div', { class: 'step-eyebrow' }, ['1 · Say thank you']),
        h('div', { class: 'section-title' }, ['Credit where it’s due']),
        thankYou.length
          ? h('div', { class: 'stack-xs' }, thankYou.map(thankYouSentence))
          : h('p', { class: 'lede' }, ['Nothing stood out here yet. That can change as you open more categories.']),
        h('p', { class: 'fine-print' }, ['Anywhere your closer look shows your spouse carrying more than your gut call gave them credit for shows up here.'])
      ]),
      h('section', { class: 'card' }, [
        h('div', { class: 'step-eyebrow' }, ['2 · Check the balance']),
        h('div', { class: 'section-title' }, [copy.title]),
        h('p', { class: 'lede' }, [copy.body]),
        copy.ask ? h('p', { class: 'ask-line' }, [copy.ask]) : null
      ]),
      h('section', { class: 'card card-accent' }, [
        h('div', { class: 'step-eyebrow' }, ['3 · Bring your spouse in']),
        h('div', { class: 'section-title' }, ['Send this to your spouse']),
        h('p', { class: 'lede' }, ['They answer on their own first. Neither of you sees the other’s answers until you’ve both finished. Then you compare, and see how close your guesses were.']),
        h('div', { class: 'footer-row' }, [
          ML.UI.button('Send an invite', { variant: 'disabled' })
        ]),
        h('p', { class: 'fine-print' }, ['Household mode is coming later. For now, compare by talking it through together.'])
      ]),
      h('div', { class: 'footer-row' }, [
        ML.UI.button('Back', { variant: 'secondary', className: 'btn-fixed', onClick: function (e) { e.preventDefault(); ML.App.go('resultSurprises'); } })
      ]),
      h('div', { class: 'cta-block' }, [startOverControl('block')])
    ]);
  }

  var RENDERERS = {
    welcome: screenWelcome,
    gut: screenGut,
    gutResult: screenGutResult,
    explainer: screenExplainer,
    closerLook: screenCloserLook,
    pickNext: screenPickNext,
    result: screenResult,
    resultGap: screenResultGap,
    resultSurprises: screenResultSurprises,
    whatNow: screenWhatNow
  };

  function render(root, state) {
    var screen = state.progress.screen || 'welcome';
    var fn = RENDERERS[screen] || screenWelcome;
    root.innerHTML = '';
    root.appendChild(fn(state));
  }

  return { render: render };
})();
