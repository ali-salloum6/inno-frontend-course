<script>
	import Comic from './Comic.svelte';
  import Icons from './Icons.svelte';
  import List from './List.svelte';
</script>


<main>
	<div class="container">
      <div class="personal-photo-container">
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img
          class="personal-photo"
          src="personal-photo.jpeg"
          alt="Personal photo"
        />
      </div>
      <h1 class="name">Ali Salloum</h1>
      <hr class="separator"/>
      <p class="desc">
        Hi! I'm a passionate blockchain developer constantly working on
        expanding my skills
      </p>
      <hr class="separator"/>
      <h1 class="section">Skills:</h1>
      <List 
        first="HTML, CSS, JavaScript, TypeScript" 
        second="Node.js, Express" 
        third="Hardhat, Solidity"
      />
      <hr class="separator"/>
      <Icons/>
      <hr class="separator"/>
      <Comic/>
    </div>
</main>

<style>
	.container {
    width: 80%;
    border-radius: 1%;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    background-color: #e5ded6;

    position: relative;
    margin: auto;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
	}

	.personal-photo-container {
  	margin-top: 5px;  
	}

	.personal-photo {
    height: 190px;
    width: 190px;
    border-radius: 50%;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}

	.name {
    font-family: "Dancing Script", cursive;
    font-size: 3rem;
    color: #927940;
	}

  .separator {
    height: 2px;
    width: 100%;
    background-color: #ba4533;
	}

	.section {
    font-family: "Dancing Script", cursive;
    color: #927940;
	}

	.desc {
    font-size: 1.5rem;
    color: #ba4533;
    margin: 15px;
	}

</style>