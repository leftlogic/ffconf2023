/**
 * Remy Sharp
 * MIT
 *
 * Designed initially for the purpose of moving through a conference schedule
 * and also display elements, such as "buy buttons" for events
 *
 * 2023-07-14
 * - supports show, hide and scroll into view
 */

const SHOW = 'show';
const HIDE = 'hide';
const SCROLL = 'scroll'; // special state that assumes it's visible, and when it ticks

function parse(s) {
  const dates = s.split(',').map((_) => _.trim());

  const isValid = (d) => d instanceof Date && !isNaN(d);

  return dates.map((_) => {
    const [a, b = Infinity] = _.split(/\s+/).map((_) => {
      if (_.trim() === '') return undefined;
      const d = new Date(_);

      if (!isValid(d)) {
        throw new Error(`Cannot parse the following timestamp: "${_}"`);
      }

      return d;
    });

    return { from: a.getTime(), until: b };
  });
}

const whenables = [];

setInterval(() => {
  for (let i = 0; i < whenables.length; i++) {
    const when = whenables[i];
    const inRange = when.inRange();

    if (inRange) {
      when[when.do]();
    } else {
      when[when.do === HIDE ? SHOW : HIDE]();
    }
  }
}, 1000);

class WhenDo extends HTMLElement {
  state = undefined;
  triggered = false;

  constructor() {
    const ref = super();

    this.do = this.attributes.do.value || SHOW;

    if (![SHOW, HIDE, SCROLL].includes(this.do)) {
      throw new Error(
        `when-do "do" property requires either "show", "hide" or "scroll"`
      );
    }

    if (this.attributes.datetime?.value) {
      this.dates = parse(this.attributes.datetime.value);
    }

    if (this.inRange()) {
      this[this.do]();
    } else {
      this[this.do === HIDE ? SHOW : HIDE]();
    }

    whenables.push(ref);
  }

  inRange() {
    const now = Date.now();

    let res = false;

    for (let i = 0; i < this.dates.length; i++) {
      const { from, until } = this.dates[i];
      if (now >= from && from < until) {
        res = true;
        break;
      }
    }

    return res;
  }

  checkTriggered() {
    if (this.triggered === false) {
      this.triggered = true;
      if (this.attributes.apply) {
        this.classList.add(this.attributes.apply.value);
      }
    }
  }

  scroll() {
    if (this.state === SCROLL) return; // nop
    this.show();
    if (this.firstElementChild) {
      this.firstElementChild.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.nextElementSibling.scrollIntoView({ behavior: 'smooth' });
    }
    this.state = SCROLL;
    this.checkTriggered();
  }

  show() {
    if (this.state === SHOW) return; // nop
    this.setAttribute('style', 'display: contents');
    this.state = SHOW;
    this.checkTriggered();
  }

  hide() {
    if (this.state === HIDE) return; // nop
    this.setAttribute('style', 'display: none');
    this.state = HIDE;
    this.checkTriggered();
  }
}

customElements.define('when-do', WhenDo);
