function input(tipo, valor) {
    const resultado = document.getElementById('resultado');
    const ultimoCaractere = resultado.value.slice(-1);

    
    const operadores = ['∧', 'v', '→', '↔'];
    const variaveis = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const parentesesAbertura = '(';
    const parentesesFechamento = ')';

    // Conta o número de parênteses de abertura e fechamento
    const numParentesesAbertura = (resultado.value.match(/\(/g) || []).length;
    const numParentesesFechamento = (resultado.value.match(/\)/g) || []).length;

    if (tipo === 'acao') {
        if (valor === 'c') {
            resultado.value = '';
        } else if (valor === '/') {
            resultado.value = resultado.value.slice(0, -1);
        } else if (valor === '=') {
            gerarTabelaVerdade(resultado.value);
        }
    } else if (tipo === 'valor') {
        // Impede inserir variável após variável ou operador após operador
        if (
            (variaveis.includes(ultimoCaractere) && variaveis.includes(valor)) ||
            (operadores.includes(ultimoCaractere) && operadores.includes(valor))
        ) {
            return; // Não permite a inserção
        }

        // Impede inserir "(" depois de uma variável
        if (variaveis.includes(ultimoCaractere) && valor === '(') {
            return; // Não permite a inserção de "(" após uma variável
        }

        // Impede inserir ")" se não houver um "(" correspondente
        if (valor === ')' && numParentesesFechamento >= numParentesesAbertura) {
            return; // Não permite inserir ")" se não houver um "(" aberto correspondente
        }

        // Permite inserir o valor
        resultado.value += valor;
    }
}


const operadores = {
    '∧': (a, b) => a && b,
    'v': (a, b) => a || b,
    '∼': (a) => !a,
    '→': (a, b) => !a || b,
    '↔': (a, b) => a === b,
};

function gerarTabelaVerdade(expressao) {
    const variaveis = [...new Set(expressao.match(/[A-Z]/g))];
    const combinacoes = gerarCombinacoes(variaveis.length);

    let tabela = '<table class="table table-bordered"><thead><tr>';
    variaveis.forEach(v => tabela += `<th>${v}</th>`);
    tabela += `<th>Resultado</th></tr></thead><tbody>`;

    let todosResultados = [];

    combinacoes.forEach(comb => {
        let expressaoAvaliada = expressao;
        variaveis.forEach((v, i) => {
            expressaoAvaliada = expressaoAvaliada.replace(new RegExp(v, 'g'), comb[i]);
        });

        let resultado = avaliarExpressao(expressaoAvaliada);
        tabela += '<tr>';
        comb.forEach(v => tabela += `<td>${v}</td>`);
        tabela += `<td>${resultado === 1 ? 'V' : 'F'}</td></tr>`;

        todosResultados.push(resultado);
    });

    tabela += '</tbody></table>';

    const propriedades = verificarPropriedades(todosResultados);

    // Adiciona o título com a propriedade lógica
    const resultadoHTML = `<h1>A expressão ${expressao} é uma ${propriedades}</h1>${tabela}`;

    document.getElementById('resultado').value = '';
    document.getElementById('tabela-verdade').innerHTML = resultadoHTML;
}

function verificarPropriedades(resultados) {
    const todosVerdadeiros = resultados.every(r => r === 1);
    const todosFalsos = resultados.every(r => r === 0);

    if (todosVerdadeiros) return 'tautologia';
    if (todosFalsos) return 'contradição';
    return 'contingência';
}

function gerarCombinacoes(n) {
    const combinacoes = [];
    const linhas = 1 << n; // 2^n, o número total de combinações

    for (let i = 0; i < linhas; i++) {
        const linha = [];
        for (let j = 0; j < n; j++) {
            const valor = (i >> (n - j - 1)) & 1;
            linha.push(valor);
        }
        combinacoes.push(linha);
    }
    return combinacoes;
}

function avaliarExpressao(expressao) {
    // Substituir variáveis booleanas
    expressao = expressao.replace(/1/g, 'false').replace(/0/g, 'true');

    // Função para avaliar uma expressão em notação pós-fixa
    function avaliarPosFix(expr) {
        const pilha = [];
        const tokens = expr.match(/true|false|∼|∧|v|→|↔|[()]/g);

        tokens.forEach(token => {
            if (token === 'true' || token === 'false') {
                pilha.push(token === 'true');
            } else if (token === '∼') {
                const val = pilha.pop();
                pilha.push(!val);
            } else if (token === '∧' || token === 'v' || token === '→' || token === '↔') {
                const b = pilha.pop();
                const a = pilha.pop();
                if (token === '∧') pilha.push(a && b);
                if (token === 'v') pilha.push(a || b);
                if (token === '→') pilha.push(!a || b);
                if (token === '↔') pilha.push(a === b);
            }
        });

        return pilha[0] ? 1 : 0;
    }

    // Função para converter expressão infixa para pós-fixa
    function infixToPostfix(expr) {
        const precedencia = { '∼': 4, '∧': 3, 'v': 2, '→': 1, '↔': 1 };
        const pilha = [];
        const resultado = [];
        const tokens = expr.match(/true|false|∼|∧|v|→|↔|[()]/g);

        tokens.forEach(token => {
            if (token === 'true' || token === 'false') {
                resultado.push(token);
            } else if (token === '∼') {
                pilha.push(token);
            } else if (token === '(') {
                pilha.push(token);
            } else if (token === ')') {
                while (pilha.length && pilha[pilha.length - 1] !== '(') {
                    resultado.push(pilha.pop());
                }
                pilha.pop(); // Remove '('
            } else if ('∧v→↔'.includes(token)) {
                while (pilha.length && precedencia[pilha[pilha.length - 1]] >= precedencia[token]) {
                    resultado.push(pilha.pop());
                }
                pilha.push(token);
            }
        });

        while (pilha.length) {
            resultado.push(pilha.pop());
        }

        return resultado.join(' ');
    }

    // Converter a expressão infixa para pós-fixa e avaliar
    const expressaoPostFix = infixToPostfix(expressao);
    return avaliarPosFix(expressaoPostFix);
}

