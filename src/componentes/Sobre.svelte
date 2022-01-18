
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
    </main>



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


main {
    background-color: rgba(0, 0, 0, 0.849);
    padding: 5px 40px;
    margin-top: 20px;
    margin-right: 25%;
    margin-left: 25%;
    border-radius: 10px;
    font-family: 'Roboto', sans-serif;
}

.cabecalho {
   color: white;
    border: 0.4px solid;
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
   color: white;
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

@media screen and (max-width: 375px){
    main {
        margin-left: 45px;
        margin-right: 45px;
        padding-left: 30px;
        padding-right: 30px;
    }
    .cabecalho{
        flex-direction: column;
    }
}
</style>