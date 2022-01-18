<script>
  export let value;
  export let handleClick;
</script>

<button  class="botao" on:click={handleClick}>{value || ""}</button>

<style>
  .botao {
    color: white;
    border-radius: 0.3cm;
    width: 52px;
    height: 50px;
    margin: 5px;
    font-size: 20px;
    text-align: center;
    float: left;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    background-color: transparent;
  }
  @media screen and (max-width: 576px){
   .botao{
    margin: 8px;
    width: 42px;
    height: 40px;
   }
   }

</style>
