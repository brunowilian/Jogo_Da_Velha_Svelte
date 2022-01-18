<script>
/* Professor, a gente fez essa de uma forma diferente para testar e aprender diferentes formas de fazer.*/

   let play2 = 0;
   let play1 = 0;
   let ganhou = null
   let botoes = Array(9).fill("")
   let jogador = true;
   $: status = "Proximo jogador: " + (jogador ? "X" : "O");

    function resetar(){
      botoes = Array(9).fill("");
      ganhou = null;
      jogador = true;;
      
    }
    function handleClick() {
      // usando o this.id 
    if (!botoes[this.id]) {
       botoes[this.id] = jogador ? "X" : "O";
       jogador= !jogador;
       ganhou = calcularGanhador(botoes); 
      }
    }
      function calcularGanhador(botoes) {
      const verificarCasas = [
        // Codigos para verificaçao para os lados
        [0, 1, 2],
        [3,4,5],
        [6,7,8],
        // Codigos para verificaçao para cima e para baixo
        [0,3,6],[1,4,7],[2,5,8],
        //Codigos para verificaçao na horizontal 
        [0,4,8],[2,4,6],
      ];
      
      // Codigo para verificar o array
      for (let i = 0; i < verificarCasas.length; i++) {
        const [a, b, c,] = verificarCasas[i];
        if (botoes[a] && botoes[a] === botoes[b] && botoes[a] === botoes[c]){
          return `Ganhou: ${botoes[a]}`;
          
        }
      }
      const empate = botoes.every(Array => Array !== "");
      return empate ? "O jogo foi empade" : "";
    }

    function placar(){
     if (ganhou == "Ganhou: X") {
       play1++
    }else if (ganhou == "Ganhou: O") {
      play2++
    }
  }

  </script>
  <main>
  <div class="placar">
      <span class="play1">JØ₲₳ĐØⱤ Ӿ : {play1}</span>
    <span class="play2">JØ₲₳ĐØⱤ Ø : {play2}</span>
  </div>
      <div>
        {#if ganhou}
        <p class="fun_placar">{placar()}</p>
        <h3 class="ganhou">{ganhou}</h3>
      {:else}
        <h3 class="status">{status}</h3>
      {/if}
      </div>

      <section class="botoes">
      <div class="mudacorl">
        <button id="0" class="quadrado" on:click={handleClick}>{botoes[0]} </button> 
        <button id="1" class="quadrado" on:click={handleClick}>{botoes[1]} </button>
        <button id="2" class="quadrado" on:click={handleClick}>{botoes[2]} </button>
      </div>
    
      <div>
        <button id="3" class="quadrado" on:click={handleClick}>{botoes[3]} </button> 
        <button id="4" class="quadrado" on:click={handleClick}>{botoes[4]} </button>
        <button id="5" class="quadrado" on:click={handleClick}>{botoes[5]} </button>
      </div>
    
      <div>
        <button id="6" class="quadrado" on:click={handleClick}>{botoes[6]} </button> 
        <button id="7" class="quadrado" on:click={handleClick}>{botoes[7]} </button>
        <button id="8" class="quadrado" on:click={handleClick}>{botoes[8]} </button>
      </div>
    </section>

      <div >
        {#if ganhou}
        <button class="reiniciar" on:click={resetar}>Reiniciar jogo</button>
      {/if}
      </div>
    </main>

  <style>
    .botoes{
      width: 170px;
      margin-left: 65px;
    }
   .placar{
    margin-bottom: 15px;
    display: flex;
    flex-direction: row;
  }
 
  .play1{
    color: white;
    font-size: 20px;
    margin-left: 0px;
    font-family: 'Roboto', sans-serif;
  }
  .play2{
    color: white;
    font-size: 20px;
    margin-left: 15px;
    font-family: 'Roboto', sans-serif;
  }
    main{
      padding-top: 15px;
      display: flexbox;
      text-align: center;
    }
  .quadrado{
    
    color: white;
    border-radius: 0.3cm;
      width: 50px;
      height: 50px;
      background-color: transparent;
      float: left; /* codigo para fazer grupo de botões*/
      font-size: 20px;  /* */
      text-align: center; 
      cursor: pointer;
      margin: 3.0px;
      font-family: 'Roboto', sans-serif;
  }
  .fun_placar{
    display: none;
    
  }
  .status{
     color: white;
   }
   button:hover{
    font-family: Arial, Helvetica, sans-serif;
   }
   .reiniciar{
     margin-top: 15px;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    color: white;
    background-color: rgba(0, 0, 0, 0.897);
   }
   .ganhou{
     color: white;
   }

   @media screen and (max-width: 375px){
     .play1, .play2, .status {
       font-size: 15px;
     }
     .botoes{
      margin-left: 32px
     }
   }
  </style>

