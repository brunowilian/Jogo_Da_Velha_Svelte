
<script>

</script>

<body>
    <main>
    <header class="cabecalho">
        <img class="cabecalho-imagem" src="imagem/ifpe.png" alt="Logo do IFPE">
        <div class="cabecalho-ifpe">
            <p class="cabecalho-ifpe-a"><strong> Instituto Federal de Educação, Ciência e Tecnologia - IFPE</strong> </p>
            <p class="cabecalho-ifpe-a"><strong>Cursos:</strong> Informática para Internet (IPI) / Sistemas para Internet (TSI)</p>
            <p class="cabecalho-ifpe-a"><strong>Componentes:</strong> Lógica de Programação e Estrutura de Dados | Programação Imperativa</p>
            <p class="cabecalho-ifpe-a"><strong>Alunos:</strong>  Amanda Gabriela, Andrey Santana, Bruno Wilian, Daniele Saara e Flávio de Lima.</p>
        </div>
    </header>

    <div class="conteudo">
        <section class="conteudo-principal">
            <br><br>
            <h1 class="conteudo-principal-titulo">Sobre</h1>
            <br><br>
            <h3 class="conteudo-principal-subtitulo">1. Sobre o Projeto:</h3>
            <br>
            <p class="conteudo-principal-paragrafo">Jogo desenvolvido por estudantes do Instituto Federal de Pernambuco - Campus Igarassu, utilizando recursos do compilador front-end Svelte para construir componentes através das linguagens JavaScript (Programação), HTML (Marcação de HiperTexto) e CSS (Estilo).</p>
            <br>
            <h3 class="conteudo-principal-subtitulo">2. Sobre o Jogo:</h3>
            <br>
            <p class="conteudo-principal-paragrafo">O jogo da velha é um jogo de regras extremamente simples, que é facilmente aprendido pelos seus jogadores e tem como objetivo fazer uma sequência de três símbolos iguais, seja em linha vertical, horizontal ou diagonal, enquanto tenta prever o movimento do adversário. Além disso, é uma boa oportunidade para estimular o raciocínio lógico, aprender a formar sequência e a ter paciência. </p>

        </section>
    </div>    
    <br>
    <br>
    </main>
    <br>
    <br>
   
</body>

<style>
    p{
        font-size: 18px;
        font-family: 'Roboto', sans-serif;
    }
    * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    text-decoration: none;
}

body {
    width: 100%;
    margin: auto;
    
   line-height: 1.0;
   color: white;   
}

main {
    background-color: rgba(0, 0, 0, 0.534);
    padding: 5px 40px;
    margin-top: 20px;
    margin-right: 25%;
    margin-left: 25%;
    border-radius: 10px;
    font-family: 'Roboto', sans-serif;
}

.cabecalho {
    background: linear-gradient(90deg, rgba(6,0,96,1) 22%, rgba(26,49,103,1) 43%, rgba(9,12,24,1) 100%);
    border: 0.4px solid;
    text-align:justific;
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 20px;
    padding: 9px;
    align-items: center;
    margin-top: 20px;
    font-family: 'Roboto', sans-serif;

}

.cabecalho-imagem {
    height: 120px;
}

.cabecalho-ifpe {
    
    text-align: left;
    font-family: 'Roboto', sans-serif;
}

.conteudo {

    margin: auto;
    width: 100%;
    height: 100%;  
    text-align:justific;
    font-size: 18px;


}

.conteudo-principal-titulo {
   
    font-size: 23px;
    text-align: center;
    font-variant: small-caps;
    font-family: 'Roboto', sans-serif;

}

.conteudo-principal-subtitulo {
  
    font-size: 23px;
    text-align: left;
    font-family: 'Roboto', sans-serif;

}

.conteudo-principal-paragrafo {

    text-align: justify;
    font-size: 20px;
    padding-left: 28px;
    font-family: 'Roboto', sans-serif;

}
</style>