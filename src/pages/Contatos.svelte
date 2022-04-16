
     <main>
      <div>
        <section>
          <h1>Contatos</h1>
          <p class="texto" >Caso tenha dúvidas ou sugestões de melhorias sobre o jogo, pode escolher  qualquer um dos desenvolvedores abaixo, que responderemos o mais breve possível. Será um prazer entrar em contato com você!</p>
          <br>
        </section>
 
        <div class="coluna">
          <!-- Inicio da bloco de perfil-->
          <div class="bloco">
            <img class="perfil" src="imagem/bruno.jpeg" alt="" />
            <div>
              <p>Bruno wilian Crispim da Silva</p>
              <br>
              <a href="https://www.linkedin.com/in/bruno-wilian-317066192/"><img class="imagem" src="imagem/linkedin.png" alt=""/></a>
              <a href="https://www.instagram.com/bruno_.wilian/"><img class="imagem" src="imagem/instagram.png" alt="Instagram" /> </a>
              <a href="https://github.com/brunowilian"><img class="imagem"  src="imagem/Github.png" alt="Github" /></a>
            </div>
          </div>
        </div>
      </div>
    </main>>
  
<style>
  .texto{
    color: white;
    font-size: 20px;
    margin-left: 40px;
    font-family: "Roboto", sans-serif;
  }
  .coluna {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    margin-left:25px;
    margin-bottom: 10px;
  }
  h1 {
    
    color: white;
    font-size: 23px;
    text-align: center;
    font-variant: small-caps;
    font-family: 'Roboto', sans-serif;
  }
  main {
    background-color: rgba(0, 0, 0, 0.849);
    padding: 2px 10px;
    margin-top: 20px;
    margin-right: 20%;
    margin-left: 20%;
    border-radius: 10px;
    font-family: "Roboto", sans-serif;
  }

  .perfil {
    border-radius: 10%;
    height: 8rem;
    width: 8rem;
    margin: 15px;
  
  }

  .bloco {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    border: solid;
    color: white;
    width: 9cm;
    margin: 0%;
    margin-left: 10px;
  }
  .imagem {
    border-radius: 50%;
    height: 25px;
    width: 25px;
    margin: 0px;
    margin-left: 10px;
  }


  @media screen and (max-width: 576px){
    main {
        margin-left: 45px;
        margin-right: 45px;
        padding-left: 30px;
        padding-right: 30px;
    }
    .coluna{
      display: flex;
      margin-top: 0px;
      margin-bottom: 0px;
      margin-left: 25px;
      flex-direction: column;
      flex-wrap: wrap;
      align-content: center;
    }
    .texto{
      margin-left: 0px
    }
    .perfil{
      margin-left: 15px;
      width: 120px;
      height: 120px;
    }
    .bloco{
      width: 290px;
      margin-left: 0px;
      margin-right: 22px;
      margin-bottom: 10px;
    }
}
</style>
