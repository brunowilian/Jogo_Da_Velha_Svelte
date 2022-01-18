<script>

	import Contatos from './componentes/Contatos.svelte';
	import Botao from './componentes/Botao.svelte';
	import Sobre from './componentes/Sobre.svelte';
	import Ajuda from './componentes/Ajuda.svelte';
	import JogoDaVelha9 from "./componentes/Jogo-da-velha9.svelte";
	import JogoDaVelha from "./componentes/Jogo-da-velha.svelte";

	let menu = 0;


	function jogarnove() {
		var x = document.getElementById("9casas");
		var y = document.getElementById("16casas");

		if (x.style.display === "none") {
			x.style.display = "block";
			y.style.display = "none";
		
		} else {
			x.style.display = "none";
		}
	}

	function jogardez(){
		var y = document.getElementById("16casas");
		var x = document.getElementById("9casas");

		if (y.style.display === "none") {
			y.style.display = "block";
			x.style.display = "none";
		} else {
			y.style.display = "none";
		}
	}


</script>

<ul id="menu">
	<li class="menuu" ><a href="/" on:click|preventDefault={() => (menu = 0)}>𝑱𝒐𝒈𝒂𝒓</a></li> 
	<li class="menuu"><a href="/" on:click|preventDefault={() => (menu = 1)}>𝑺𝒐𝒃𝒓𝒆</a></li>  
	<li class="menuu"><a href="/" on:click|preventDefault={() => (menu = 2)}>𝑨𝒋𝒖𝒅𝒂</a></li> 
	<li class="menuu"><a href="/" on:click|preventDefault={() => (menu = 3)}>𝑪𝒐𝒏𝒕𝒂𝒕𝒐</a></li> 
</ul>

{#if menu === 0}
<div class="botoesmudar">
<!-- Comentario-->
	<button on:click={jogarnove}>𝐉𝐨𝐠𝐚𝐫 𝐜𝐨𝐦 𝟗 𝐜𝐚𝐬𝐚𝐬.</button>
	<button on:click={jogardez}>𝐉𝐨𝐠𝐚𝐫 𝐜𝐨𝐦 𝟏𝟔 𝐜𝐚𝐬𝐚𝐬.</button>
</div>
<main>
	<div class="acasas"   id="9casas"> 
		<JogoDaVelha9/>
	</div>
	<div class="ycasas" id="16casas">
		<JogoDaVelha/>
	</div>
</main>
{:else if menu === 1}
<Sobre/>
{:else if menu === 2}
<Ajuda />
{:else if menu === 3}
<Contatos/>
{/if}

<style>
	.menuu{
		margin-left: 15px;
	}

.botoesmudar{
	text-align: center;
	margin-top: 20px;
}

ul {
  list-style-type: none;
  margin: 0px;
  padding: 0;
  overflow: hidden;
}
li {
  float: left;
}
li a {
	background-color: rgba(0, 0, 0, 0.897);
  color: white;
  display: block;
  text-align: center;
  padding: 1px 18px;
  text-decoration: none;
	margin-left: 5px;
	border: solid;
	border-style: groove;
	border-radius: 5px;
}
.ycasas{
	display: none;
	padding-top: 10px;
	
}
.acasas{
	display: none;
	text-align: center;
}
	main {
		
		height: 500px;
		width: 500px;
		margin-left: 32%;
		margin-right: 50%;
		background-color: rgba(0, 0, 0, 0.849);
		margin-top: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		line-height: 10px;
		border-radius: 10%;
	}

	button {
		background-color: rgba(0, 0, 0, 0.897);
    color: white;
		font-size: 0.4cm;
		margin: 1px;
		font-family: 'Roboto', sans-serif;
	}

	@media screen and (max-width: 576px){
		li, button{
			font-size: 10px;
		}

		main{
		width: 300px;
    height: 345px;
    margin-left: 25px
		}
		.ycasas{
			font-size: 10px;
		}
		.menuu{
			margin-left: 5px
		}


	}
</style>
