// // ES6 class

const css = /* css */`

  button {
    appearance: none;
    border: none;
    background: none;
    all: inherit;
    padding-top: 16px;
    border-top: 1px solid #333;
    margin-top: 24px;
  }

  button:focus [name="summary"] {
    outline: 1px solid blue;
  }
  
  [name="summary"] {
    background: none;
    display: block;
    cursor: pointer;
    user-select: none;
    display: block;
    font-family: 'Inter Tight', sans-serif;
    font-size: 16px;
    line-height: 24px;
    position: relative;
  }

  [name="summary"]:after {
    content: "";
    display: block;
    position: absolute;
    right: 0;
    top: 0px;
    width: 16px;
    height: 24px;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 2 6 6 2 2' stroke='%23D4AF37' stroke-width='2' stroke-miterlimit='10' stroke-linecap='square'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 100ms ease-out;
  }

  /* kept because it's nice to know
  ::slotted([slot="details"]) {
    text-decoration: underline;
  }
  */

  :host([open]) [name="summary"]:after {
    transform: rotate(180deg);
  }

  :host([open]) button {
    margin-top: 0px;
  }

  .details {
    display: flex;
    flex-direction: column-reverse;
  }

  @media screen and (min-width: 420px) {
    [name="summary"], button {
      display: none;
    }

    [name="details"] {
      display: block !important;
    }
  }
`;

const template = document.createElement('template');
template.innerHTML = /*html*/ `
  <style>
  ${css}
  </style>
  <div class="details">
    <button><slot name="summary">More details</slot></button>
    <slot name="details"></slot>
  </div>`;


class RemDetails extends HTMLElement {

  _open = false;
  
  constructor() {
    super();
    console.log('construct');
    
    const children = template.content.cloneNode(true);

    // parent node gets us the button it's wrapped in
    const summary = children.querySelector('slot[name="summary"]').parentNode;
    summary.onclick = (e) => this.open = !this.open;

    this.details = children.querySelector('slot[name="details"]');

    // mode: open - means accessed in user code
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true }).appendChild(children);

    const title = this.shadowRoot.host.getAttribute('title');

    const open = !!this.shadowRoot.host.getAttribute('open');
    this.open = open;
  }

  get open() {
    return this._open;
  }

  set open(value) {
    const open = value;
    this.details.hidden = !open;
    if (open) {
      this.shadowRoot.host.setAttribute('open', '');
    } else {
      this.shadowRoot.host.removeAttribute('open');
    }
    
    this._open = open;
  }
}
window.customElements.define('rem-details', RemDetails);