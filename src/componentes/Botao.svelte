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
    margin: 5.0px;
    font-size: 20px;
    text-align: center;
    float: left;
    cursor: pointer;
    font-family: 'Roboto', sans-serif;
    background-color: transparent;
  }
</style>
