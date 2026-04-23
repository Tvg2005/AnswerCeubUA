// ==UserScript==
// @name         Robô das UAs - Modo Furtivo
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Resolve questões das UAs. Lê o iframe pelo contexto pai para fugir do bloqueio CORS.
// @match        *://ceub-edu.grupoa.education/*
// @match        *://*.grupoa.education/*
// @match        *://*.sagah.com.br/*
// @grant        GM_xmlhttpRequest
// @connect      openrouter.ai
// ==/UserScript==

(function () {
    'use strict';

    const API_KEY = "API_KEY";
    const MODELO = "MODELO";

    // ─── INJETA O BOTÃO NA PÁGINA PAI ────────────────────────────────────────
    // O botão fica na página principal (ceub-edu), que não tem CSP bloqueando o fetch.
    // O texto da questão é lido do iframe abaixo.

    let btn = document.createElement("button");
    btn.innerHTML = "🤖 Resolver UA";
    btn.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 9999999;
        padding: 14px 22px; background: #24A148; color: white;
        border: none; border-radius: 8px; cursor: pointer;
        font-size: 15px; font-weight: bold;
        box-shadow: 0px 6px 14px rgba(0,0,0,0.5);
        font-family: sans-serif;
    `;
    document.body.appendChild(btn);

    btn.onclick = async function () {
        setStatus("⏳ Lendo questão...", "#ff9800");
        btn.disabled = true;
        await rodarCiclo();
    };

    function setStatus(txt, cor) {
        btn.innerHTML = txt;
        if (cor) btn.style.background = cor;
    }

    // ─── LÊ O TEXTO DO IFRAME ───────────────────────────────────────────────
    // Itera pelos iframes da página atual e pega o innerText do que tiver "A."
    function lerTextoDoIframe() {
        let frames = document.querySelectorAll('iframe');
        for (let f of frames) {
            try {
                let doc = f.contentDocument || f.contentWindow.document;
                let texto = doc.body.innerText;
                // Verifica se é a tela de questão procurando padrão "A."
                if (texto.includes("A.") || texto.includes("A ")) {
                    return { texto, doc };
                }
            } catch (e) {
                // iframe de outra origem — não conseguimos ler (CORS). Ignora.
            }
        }
        // Tenta a própria página se não tiver iframe acessível
        let textoLocal = document.body.innerText;
        if (textoLocal.includes("A.")) return { texto: textoLocal, doc: document };
        return null;
    }

    // ─── CHAMA A IA (fetch no contexto pai, sem bloqueio de iframe) ──────────
    function chamarIA(texto) {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://openrouter.ai/api/v1/chat/completions",
                timeout: 20000,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + API_KEY
                },
                data: JSON.stringify({
                    model: MODELO,
                    messages: [{
                        role: "user",
                        content:
                            "Você é um assistente de provas. Leia o exercício abaixo e responda APENAS com a letra correta (A, B, C, D ou E). Nenhuma explicação, nenhuma frase, só a letra.\n\n" + texto
                    }]
                }),
                onload: function (res) {
                    try {
                        let json = JSON.parse(res.responseText);
                        let bruto = json.choices[0].message.content.trim().toUpperCase();
                        console.log("[Robô UA] IA disse:", bruto);

                        // Extrai a primeira letra A-E que aparecer
                        let match = bruto.match(/\b([A-E])\b/) || bruto.match(/([A-E])/);
                        resolve(match ? match[1] : "");
                    } catch (e) {
                        console.error("[Robô UA] Erro ao parsear resposta:", e);
                        resolve("");
                    }
                },
                onerror: function (e) {
                    console.error("[Robô UA] Erro de rede:", e);
                    resolve("");
                },
                ontimeout: function () {
                    console.warn("[Robô UA] Timeout na IA");
                    resolve("");
                }
            });
        });
    }

    // ─── CLICA NA ALTERNATIVA CORRETA ───────────────────────────────────────
    function clicarAlternativa(letra, doc) {
        let alvoDoc = doc || document;
        let elementos = alvoDoc.querySelectorAll('p, span, div, label, li');

        for (let el of elementos) {
            let text = el.innerText ? el.innerText.trim() : "";
            // Detecta "A." ou "A " no início do elemento folha
            if (el.children.length === 0 && text.match(new RegExp("^" + letra + "[\\s\\.]"))) {

                // Sobe na árvore para encontrar o container clicável
                let alvo = el.closest('li, label, .alternative, .opcao, [role="radio"]') || el.parentElement || el;

                // Dispara eventos de mouse (imita comportamento humano)
                ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(tipo => {
                    alvo.dispatchEvent(new MouseEvent(tipo, { bubbles: true, cancelable: true, view: alvoDoc.defaultView }));
                });

                // Força o radio button se existir
                let radio = alvo.querySelector('input[type="radio"]')
                    || alvo.parentElement?.querySelector('input[type="radio"]');
                if (radio) {
                    radio.click();
                    radio.checked = true;
                    radio.dispatchEvent(new Event('input', { bubbles: true }));
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                }
                return true;
            }
        }
        return false;
    }

    // ─── CLICA EM PRÓXIMO OU FINALIZAR ───────────────────────────────────────
    function clicarProximo(doc) {
        // Busca APENAS dentro do iframe da questão (doc).
        // Isso evita clicar no link "Na prática" da barra de navegação da página principal.
        let alvoDoc = doc || document;

        let botoes = alvoDoc.querySelectorAll('button, [role="button"]');
        for (let b of botoes) {
            let txt = b.innerText.toLowerCase().trim();
            if (txt.includes('próximo') || txt.includes('proximo') || txt.includes('next')) {
                b.click();
                return "proximo";
            }
            if (txt.includes('finalizar') || txt.includes('enviar') || txt.includes('concluir')) {
                b.click();
                return "finalizar";
            }
        }
        return null;
    }

    // ─── CICLO PRINCIPAL ────────────────────────────────────────────────────
    async function rodarCiclo() {
        // 1. Lê o conteúdo do iframe
        let alvo = lerTextoDoIframe();
        if (!alvo) {
            setStatus("⚠️ Nenhuma questão encontrada", "#e53935");
            btn.disabled = false;
            return;
        }

        // 2. Consulta a IA
        setStatus("🧠 Perguntando à IA...", "#1565C0");
        let letra = await chamarIA(alvo.texto);

        if (!["A", "B", "C", "D", "E"].includes(letra)) {
            setStatus("❌ IA não respondeu. Tente novamente.", "#e53935");
            btn.disabled = false;
            return;
        }

        // 3. Clica na alternativa dentro do iframe
        setStatus("🖱️ Marcando " + letra + "...", "#6a1b9a");
        let clicou = clicarAlternativa(letra, alvo.doc);

        if (!clicou) {
            setStatus("⚠️ Não encontrei o elemento " + letra, "#e53935");
            btn.disabled = false;
            return;
        }

        // 4. Aguarda e clica em Próximo/Finalizar
        await new Promise(r => setTimeout(r, 1200));
        let acao = clicarProximo(alvo.doc);

        if (acao === "proximo") {
            setStatus("⏩ Próxima...", "#ff9800");
            // Aguarda a próxima questão carregar e reinicia o ciclo
            await new Promise(r => setTimeout(r, 2500));
            await rodarCiclo();
        } else if (acao === "finalizar") {
            setStatus("🎉 UA Concluída!", "#24A148");
            btn.disabled = false;
        } else {
            setStatus("✅ Marcou " + letra + " — avance manualmente", "#24A148");
            btn.disabled = false;
        }
    }

})();
