/* ==========================================================================
   GRUPO ARANDU — Interações (JavaScript puro, sem dependências)
   - Menu móvel acessível
   - Validação dos formulários de newsletter e contato
   - Paginação simulada das editorias (client-side)
   - "Salvar artigo" com localStorage
   - Progresso de leitura e compartilhamento
   ========================================================================== */

(function () {
  "use strict";

  var $ = function (selector, context) {
    return (context || document).querySelector(selector);
  };

  var $$ = function (selector, context) {
    return Array.prototype.slice.call(
      (context || document).querySelectorAll(selector)
    );
  };

  var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ------------------------------------------------------------------------
     1. Ano corrente no rodapé
     ------------------------------------------------------------------------ */
  $$("[data-year]").forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------------------------
     2. Cabeçalho: estado ao rolar + menu móvel
     ------------------------------------------------------------------------ */
  var header = $("[data-header]");
  var navToggle = $("[data-nav-toggle]");
  var nav = $("[data-nav]");

  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (header && navToggle && nav) {
    var setMenuState = function (isOpen) {
      header.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"
      );
    };

    navToggle.addEventListener("click", function () {
      setMenuState(!header.classList.contains("is-open"));
    });

    // Fecha o menu ao escolher um destino
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setMenuState(false);
      }
    });

    // Fecha com Escape e devolve o foco ao botão
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && header.classList.contains("is-open")) {
        setMenuState(false);
        navToggle.focus();
      }
    });

    // Fecha ao clicar fora do cabeçalho
    document.addEventListener("click", function (event) {
      if (
        header.classList.contains("is-open") &&
        !header.contains(event.target)
      ) {
        setMenuState(false);
      }
    });

    // Ao entrar no layout desktop, garante o menu fechado
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1000) {
        setMenuState(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. Newsletter — validação e console.log para testes de integração
     ------------------------------------------------------------------------ */
  $$("form[data-newsletter]").forEach(function (form) {
    var emailInput = form.querySelector('input[type="email"]');
    var honeypot = form.querySelector('input[name="website"]');
    var errorBox = form.querySelector("[data-form-error]");
    var statusBox = form.querySelector("[data-form-status]");

    if (!emailInput) {
      return;
    }

    var showError = function (message) {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.hidden = !message;
      }

      emailInput.setAttribute("aria-invalid", message ? "true" : "false");
    };

    var clearFeedback = function () {
      if (errorBox && !errorBox.hidden) {
        showError("");
      }

      if (statusBox) {
        statusBox.textContent = "";
      }
    };

    emailInput.addEventListener("input", clearFeedback);

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Campo armadilha: preenchido = robô. Encerra silenciosamente.
      if (honeypot && honeypot.value.trim() !== "") {
        return;
      }

      var email = emailInput.value.trim();

      if (!email) {
        showError("Informe seu e-mail para receber o Radar Diário.");
        emailInput.focus();
        return;
      }

      if (!EMAIL_REGEX.test(email)) {
        showError("Digite um e-mail válido, como nome@dominio.com.br.");
        emailInput.focus();
        return;
      }

      showError("");

      var payload = {
        email: email,
        origem: form.getAttribute("data-origem") || window.location.pathname,
        consentimento: true,
        criadoEm: new Date().toISOString()
      };

      // Ponto de integração futuro:
      // fetch(form.action, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload)
      // })
      console.log("[Arandu · Radar Diário] Inscrição pronta para envio:", payload);

      if (statusBox) {
        statusBox.textContent =
          "Inscrição recebida. Em breve você começará a receber o Radar Diário.";
      }

      form.reset();
    });
  });

  /* ------------------------------------------------------------------------
     4. Formulário de contato
     ------------------------------------------------------------------------ */
  var contactForm = $("form[data-contact]");

  if (contactForm) {
    var fields = {
      nome: contactForm.querySelector("#contato-nome"),
      email: contactForm.querySelector("#contato-email"),
      assunto: contactForm.querySelector("#contato-assunto"),
      mensagem: contactForm.querySelector("#contato-mensagem"),
      consentimento: contactForm.querySelector("#contato-consentimento")
    };

    var contactStatus = contactForm.querySelector("[data-form-status]");

    var setFieldError = function (field, message) {
      if (!field) {
        return;
      }

      var errorElement = contactForm.querySelector(
        '[data-error-for="' + field.id + '"]'
      );

      field.setAttribute("aria-invalid", message ? "true" : "false");

      if (errorElement) {
        errorElement.textContent = message;
      }
    };

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];

      if (field) {
        var eventName = field.type === "checkbox" ? "change" : "input";
        field.addEventListener(eventName, function () {
          setFieldError(field, "");
          if (contactStatus) {
            contactStatus.textContent = "";
          }
        });
      }
    });

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var nome = fields.nome ? fields.nome.value.trim() : "";
      var email = fields.email ? fields.email.value.trim() : "";
      var assunto = fields.assunto ? fields.assunto.value : "";
      var mensagem = fields.mensagem ? fields.mensagem.value.trim() : "";
      var consentimento = fields.consentimento
        ? fields.consentimento.checked
        : false;

      var firstInvalid = null;

      setFieldError(fields.nome, "");
      setFieldError(fields.email, "");
      setFieldError(fields.assunto, "");
      setFieldError(fields.mensagem, "");
      setFieldError(fields.consentimento, "");

      if (nome.length < 2) {
        setFieldError(fields.nome, "Informe seu nome completo.");
        firstInvalid = firstInvalid || fields.nome;
      }

      if (!EMAIL_REGEX.test(email)) {
        setFieldError(fields.email, "Digite um e-mail válido.");
        firstInvalid = firstInvalid || fields.email;
      }

      if (!assunto) {
        setFieldError(fields.assunto, "Selecione um assunto.");
        firstInvalid = firstInvalid || fields.assunto;
      }

      if (mensagem.length < 10) {
        setFieldError(
          fields.mensagem,
          "Descreva sua mensagem com pelo menos 10 caracteres."
        );
        firstInvalid = firstInvalid || fields.mensagem;
      }

      if (!consentimento) {
        setFieldError(
          fields.consentimento,
          "É necessário concordar com a Política de Privacidade."
        );
        firstInvalid = firstInvalid || fields.consentimento;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var payload = {
        nome: nome,
        email: email,
        assunto: assunto,
        mensagem: mensagem,
        consentimento: consentimento,
        origem: window.location.pathname,
        criadoEm: new Date().toISOString()
      };

      // Ponto de integração futuro com /api/contact
      console.log("[Arandu · Contato] Mensagem pronta para envio:", payload);

      if (contactStatus) {
        contactStatus.textContent =
          "Mensagem registrada. Retornaremos em até 2 dias úteis.";
      }

      contactForm.reset();
    });
  }

  /* ------------------------------------------------------------------------
     5. Paginação simulada das editorias
     ------------------------------------------------------------------------ */
  $$("[data-pagination]").forEach(function (pagination) {
    var scope = pagination.closest("[data-pagination-scope]") || document;
    var panels = $$("[data-page-panel]", scope);
    var pageButtons = $$("[data-page-target]", pagination);
    var prevButton = $("[data-page-prev]", pagination);
    var nextButton = $("[data-page-next]", pagination);
    var status = $("[data-pagination-status]", pagination);
    var totalPages = panels.length;

    if (totalPages < 2) {
      return;
    }

    var currentPage = 1;
    var requestedPage = parseInt(
      new URLSearchParams(window.location.search).get("pagina"),
      10
    );

    if (requestedPage >= 1 && requestedPage <= totalPages) {
      currentPage = requestedPage;
    }

    var renderPage = function (page, shouldScroll) {
      currentPage = page;

      panels.forEach(function (panel) {
        panel.hidden = Number(panel.getAttribute("data-page-panel")) !== page;
      });

      pageButtons.forEach(function (button) {
        var isCurrent =
          Number(button.getAttribute("data-page-target")) === page;

        if (isCurrent) {
          button.setAttribute("aria-current", "page");
        } else {
          button.removeAttribute("aria-current");
        }
      });

      if (prevButton) {
        prevButton.disabled = page === 1;
      }

      if (nextButton) {
        nextButton.disabled = page === totalPages;
      }

      if (status) {
        status.textContent = "Página " + page + " de " + totalPages;
      }

      // Mantém a URL compartilhável sem recarregar a página
      var url = new URL(window.location.href);

      if (page === 1) {
        url.searchParams.delete("pagina");
      } else {
        url.searchParams.set("pagina", page);
      }

      try {
        window.history.replaceState(null, "", url.toString());
      } catch (error) {
        // Histórico indisponível (ex.: abertura local via file://)
      }

      if (shouldScroll) {
        var headerHeight = header ? header.offsetHeight : 0;
        var top =
          scope.getBoundingClientRect().top +
          window.scrollY -
          headerHeight -
          24;

        window.scrollTo({
          top: Math.max(top, 0),
          behavior: prefersReducedMotion ? "auto" : "smooth"
        });
      }
    };

    pageButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        renderPage(Number(button.getAttribute("data-page-target")), true);
      });
    });

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        if (currentPage > 1) {
          renderPage(currentPage - 1, true);
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        if (currentPage < totalPages) {
          renderPage(currentPage + 1, true);
        }
      });
    }

    renderPage(currentPage, false);
  });

  /* ------------------------------------------------------------------------
     6. "Salvar este artigo" (localStorage)
     ------------------------------------------------------------------------ */
  var bookmarkButton = $("[data-bookmark]");

  if (bookmarkButton) {
    var STORAGE_KEY = "arandu:artigos-salvos";
    var bookmarkLabel = $("[data-bookmark-label]", bookmarkButton);
    var bookmarkStatus = $("[data-bookmark-status]");
    var pageUrl = window.location.href.split("#")[0];

    var readSaved = function () {
      try {
        var stored = JSON.parse(
          window.localStorage.getItem(STORAGE_KEY) || "[]"
        );
        return Array.isArray(stored) ? stored : [];
      } catch (error) {
        return [];
      }
    };

    var writeSaved = function (list) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (error) {
        // Armazenamento indisponível (modo privado): falha silenciosa
      }
    };

    var syncBookmark = function (isSaved) {
      bookmarkButton.classList.toggle("is-saved", isSaved);
      bookmarkButton.setAttribute("aria-pressed", String(isSaved));

      if (bookmarkLabel) {
        bookmarkLabel.textContent = isSaved ? "Artigo salvo" : "Salvar artigo";
      }

      if (bookmarkStatus) {
        bookmarkStatus.textContent = isSaved
          ? "Artigo salvo neste navegador."
          : "Artigo removido dos salvos.";
      }
    };

    syncBookmark(
      readSaved().some(function (item) {
        return item.url === pageUrl;
      })
    );

    bookmarkButton.addEventListener("click", function () {
      var saved = readSaved();
      var alreadySaved = saved.some(function (item) {
        return item.url === pageUrl;
      });

      if (alreadySaved) {
        saved = saved.filter(function (item) {
          return item.url !== pageUrl;
        });
      } else {
        saved.push({
          url: pageUrl,
          titulo: document.title,
          salvoEm: new Date().toISOString()
        });
      }

      writeSaved(saved);
      syncBookmark(!alreadySaved);
    });
  }

  /* ------------------------------------------------------------------------
     7. Progresso de leitura do artigo
     ------------------------------------------------------------------------ */
  var progressBar = $("[data-reading-progress]");
  var articleBody = $("[data-article-body]");

  if (progressBar && articleBody) {
    var updateProgress = function () {
      var start = articleBody.offsetTop;
      var readableHeight = Math.max(articleBody.offsetHeight - window.innerHeight * 0.6, 1);
      var scrolled = window.scrollY - start + window.innerHeight * 0.35;
      var percentage = Math.min(Math.max(scrolled / readableHeight, 0), 1) * 100;

      progressBar.style.setProperty("--progress", percentage.toFixed(2) + "%");
    };

    var requestTick = false;

    var onProgressScroll = function () {
      if (requestTick) {
        return;
      }

      requestTick = true;

      window.requestAnimationFrame(function () {
        updateProgress();
        requestTick = false;
      });
    };

    updateProgress();
    window.addEventListener("scroll", onProgressScroll, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  /* ------------------------------------------------------------------------
     8. Compartilhamento
     ------------------------------------------------------------------------ */
  var canonicalLink = document.querySelector('link[rel="canonical"]');
  var shareUrl = canonicalLink ? canonicalLink.href : window.location.href;
  var shareTitle = document.title;

  $$("[data-share]").forEach(function (link) {
    var network = link.getAttribute("data-share");

    if (network === "whatsapp") {
      link.href =
        "https://wa.me/?text=" +
        encodeURIComponent(shareTitle + " — " + shareUrl);
    }

    if (network === "linkedin") {
      link.href =
        "https://www.linkedin.com/sharing/share-offsite/?url=" +
        encodeURIComponent(shareUrl);
    }
  });

  var copyButton = $("[data-copy-link]");

  if (copyButton) {
    var copyLabel = $("[data-copy-label]", copyButton);
    var copyResetTimer = null;

    var legacyCopy = function (text) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
      } catch (error) {
        // Sem suporte a clipboard
      }

      document.body.removeChild(textarea);
    };

    var showCopied = function () {
      if (!copyLabel) {
        return;
      }

      copyLabel.textContent = "Link copiado";

      window.clearTimeout(copyResetTimer);
      copyResetTimer = window.setTimeout(function () {
        copyLabel.textContent = "Copiar link";
      }, 2500);
    };

    copyButton.addEventListener("click", function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(window.location.href).then(showCopied).catch(function () {
          legacyCopy(window.location.href);
          showCopied();
        });
      } else {
        legacyCopy(window.location.href);
        showCopied();
      }
    });
  }
})();
