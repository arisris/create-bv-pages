customElements.define("counter-app", class extends HTMLElement {
  static observedAttributes = ["initial"]
  count = 0
  shadow = this.attachShadow({ mode: "open" })
  constructor() {
    super()
    this.count = parseInt(this.getAttribute("initial") ?? "0")
    const template = document.createElement("template")
    template.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1rem;
          background-color: #f1f1f1;
        }

        h4 {
          font-size: 2rem;
          margin: 0;
          padding: 0;
        }

        button {
          font-size: 1.5rem;
          padding: 0.5rem 1rem;
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
        }
        
      </style>
      <h4 id="count">${this.count}</h4>
      <button id="increment">+</button>
      <button id="decrement">-</button>
    `
    this.shadow.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    const incrementButton = this.shadow.getElementById("increment")!
    const decrementButton = this.shadow.getElementById("decrement")!
    const countElement = this.shadow.getElementById("count")!
    incrementButton.addEventListener("click", () => {
      this.count++
      countElement.textContent = String(this.count)
    })
    decrementButton.addEventListener("click", () => {
      this.count--
      countElement.textContent = String(this.count)
    })
  }
})