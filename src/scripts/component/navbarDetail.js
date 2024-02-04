class NavbarDetail extends HTMLElement {
  constructor () {
    super();

    // shadow DOM
    this.attachShadow({ mode: 'open' });

    // Link navbar
    this.links = [
      { text: 'Home', url: 'index.html' },
      { text: 'Sign Up', url: '#' },
      { text: 'Login', url: '#' }
    ];
  }

  connectedCallback () {
    // elemen nav
    const nav = document.createElement('nav');
    nav.classList.add('navbar-detail-meal');

    this.links.forEach(link => {
      const anchor = document.createElement('a');
      anchor.textContent = link.text;
      anchor.href = link.url;
      nav.appendChild(anchor);
    });

    // elemen style
    const style = document.createElement('style');
    style.textContent = `
            .navbar-detail-meal a {
            /* Tambahkan gaya CSS sesuai keinginan Anda */
            color: #783D19;
            font-family: 'Poppins', sans-serif;
            text-decoration: none;
            margin-right: 1rem;
            }
            .navbar-detail-meal a:hover {
            text-decoration: underline;
            }
        `;

    // elemen style dan nav ditambahkan ke shadow DOM
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(nav);
  }
}

// Daftarkan custom element
customElements.define('navbar-details', NavbarDetail);
