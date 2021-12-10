<script lang="ts">
  import Modal from '../../components/Modal.svelte'
  let shown = true
</script>

{#if shown}
<Modal initialfocus='input[type="submit"]' on:dismiss={() => shown = false}>
  <form>
    <div class="formfield">
      <label for="firstname">First Name:</label><input id="firstname" type="text" name="firstname">
    </div>
    <div class="formfield">
      <label for="middlename">Middle Name:</label><input id="middlename" type="text" name="middlename">
    </div>
    <div class="formfield">
      <label for="lastname">Last Name:</label><input id="lastname" type="text" name="lastname">
    </div>
    <input type="submit" value="Submit">
  </form>
</Modal>
{/if}
<div class="content">
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer tempus nulla ut nulla auctor, quis sodales massa laoreet. Duis erat lacus, gravida vitae massa vel, semper accumsan urna. Morbi gravida dui sit amet sodales luctus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum eget pulvinar dui. Vivamus quis eros eu ex semper consectetur nec at elit. Praesent faucibus arcu a nisi semper, eu tempus felis vehicula. Suspendisse potenti.</p>

  <p>Donec luctus nulla mattis ipsum aliquam imperdiet. Vestibulum nec finibus enim. Proin et arcu arcu. Quisque feugiat leo velit, vitae mollis felis ornare sed. Suspendisse sollicitudin, libero sed ullamcorper finibus, diam turpis eleifend velit, ut suscipit orci mauris id purus. Donec dapibus facilisis mauris a venenatis. Maecenas gravida velit maximus nibh tincidunt, eget auctor tellus efficitur. Aenean varius tristique lacus, sit amet placerat sem tempor at. Sed imperdiet fermentum nibh, sit amet tempor est cursus ac.</p>
  <button on:click={() => shown = true}>Show Modal</button>
  <p>Praesent augue magna, maximus at mattis eget, euismod nec neque. Phasellus ut dolor a turpis molestie fermentum. Phasellus condimentum, ipsum sed rutrum maximus, diam ex ultrices sapien, quis iaculis nisi arcu at turpis. Morbi aliquam mattis posuere. Integer pretium diam diam, non lobortis quam consectetur laoreet. Sed posuere blandit venenatis. Nulla gravida maximus arcu non consectetur.</p>

  <p>Cras egestas massa mattis dictum imperdiet. Nulla bibendum nisl ipsum, ut scelerisque arcu consectetur vitae. Integer convallis id nunc sit amet faucibus. Maecenas suscipit diam orci, ac suscipit dolor convallis sed. Mauris vel tellus eget nunc mattis faucibus sit amet sed lorem. Cras lobortis, massa at vestibulum dignissim, quam tellus sagittis purus, eget dictum dolor quam in leo. Aliquam condimentum, ante sit amet semper laoreet, lacus est scelerisque mi, nec mollis diam massa et massa. Donec sagittis massa quis diam dictum, sit amet convallis mauris tincidunt. Nam vulputate ligula quis ex condimentum, in sollicitudin dolor accumsan. Donec volutpat dui in faucibus tempus. Proin vitae tincidunt ex. Proin ut ultricies diam. Praesent sed purus in purus efficitur fermentum vulputate quis dolor. Morbi viverra quam ac dolor facilisis consectetur.</p>

  <p>Phasellus convallis congue mi, at auctor neque facilisis vestibulum. Maecenas tincidunt eros nec ornare vehicula. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean odio erat, efficitur sit amet neque ut, condimentum scelerisque enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sagittis nisl aliquam, rutrum eros eget, luctus augue. Praesent sollicitudin facilisis nisi, eget tincidunt dolor vestibulum sed. Nullam auctor consequat est, sit amet convallis sem fermentum vitae. Pellentesque tempor, turpis vel tristique imperdiet, tellus nunc blandit lorem, et tristique velit dui sed ante. Praesent tempor, sem at vulputate porta, dolor lacus condimentum augue, non tincidunt magna sapien ultrices massa. In consequat, ligula ac elementum ornare, enim dui semper metus, a vehicula arcu odio at sapien. Donec et sodales dui, sed tempus turpis.</p>

  <p>Donec quis elit dolor. Proin rutrum lorem sapien, eu tempor urna commodo facilisis. Nunc at est eu purus mattis auctor eget et libero. In auctor dictum massa, nec hendrerit augue facilisis a. Vestibulum sit amet accumsan dolor, sit amet porta ante. Nam fringilla, velit eu tempus pulvinar, magna nibh iaculis dolor, a rutrum nibh turpis vel metus. Mauris quis lorem et nunc blandit feugiat. Phasellus vitae luctus turpis, id blandit nulla. Aliquam imperdiet mattis ante laoreet ullamcorper. Vivamus in laoreet purus, id fermentum velit. Phasellus eleifend libero in velit feugiat rhoncus.</p>

  <p>Maecenas et mattis erat. Fusce volutpat urna tortor, sed lobortis sapien dignissim nec. Morbi id aliquet nunc. In hac habitasse platea dictumst. Mauris in lobortis dolor. Nunc orci urna, vehicula et turpis a, sagittis gravida est. Sed quis sem sapien. Morbi finibus neque lorem, non lobortis magna sodales vitae. In feugiat metus purus, ac rhoncus lorem tristique id. Nulla volutpat ex ac nulla ultrices, nec pellentesque urna semper. Donec a neque finibus, faucibus mi ac, viverra diam. Nullam a nisi vel enim gravida semper. Nam a ante nisi. Fusce tempor odio diam, vel commodo odio tempor et. Praesent sagittis consequat leo, eu efficitur justo finibus dignissim. Suspendisse in commodo sapien.</p>

  <p>Pellentesque varius dui mauris, eget commodo lectus aliquet quis. Nulla vehicula vitae est ut euismod. Vivamus tempus tempus volutpat. Etiam cursus in leo et pulvinar. Vestibulum interdum porttitor efficitur. Morbi vestibulum dignissim massa nec molestie. Nullam eu sodales leo, nec pharetra arcu. Proin accumsan ligula ac lorem ullamcorper lacinia. Duis ut mi quis augue auctor tempor. Duis volutpat elit nec venenatis pharetra. Suspendisse luctus placerat tincidunt. Cras interdum interdum felis id vehicula. Aenean quis erat nec urna gravida tristique id in turpis. Integer dapibus placerat enim, vitae vehicula elit.</p>

  <p>Fusce lorem magna, molestie euismod tincidunt et, hendrerit nec nibh. Duis id nibh nisl. Cras lectus sapien, hendrerit vitae dui eu, tincidunt tristique magna. Pellentesque molestie in velit in volutpat. Morbi egestas lacus neque, sit amet pulvinar sem volutpat ut. Aenean congue bibendum nisl ut malesuada. Donec mattis laoreet commodo. Nulla accumsan maximus porttitor.</p>

  <p>Phasellus vel mi nec sapien pharetra mattis quis nec orci. Praesent eu suscipit nisi, a euismod nisi. Sed id dolor quis nisl tincidunt accumsan. Aliquam aliquam sed erat eu vehicula. Sed vestibulum felis egestas, pharetra nisi vel, fringilla sem. In maximus dui in hendrerit vulputate. Quisque lobortis iaculis lacus, sit amet lacinia sapien interdum sed. Vivamus congue neque fringilla tellus pellentesque blandit. Sed nec sapien at nisl molestie sollicitudin. Etiam a nulla tortor. Ut non tellus turpis. Curabitur ultrices pharetra velit, sed ultricies magna viverra sed.</p>

  <p>Nunc in vehicula diam, ac molestie est. Aliquam efficitur at neque nec tristique. Nullam elementum arcu quis dolor sodales pulvinar. Phasellus pretium, ex at hendrerit rhoncus, orci diam mattis purus, a tempor nisi mauris vitae lectus. Aenean eget vulputate diam. Ut ultrices, nunc id hendrerit mattis, mi felis sagittis sapien, eget euismod massa risus eu risus. Morbi euismod vulputate ultrices. Etiam et pretium elit. Suspendisse potenti. Proin scelerisque convallis purus, at viverra massa fermentum a. Curabitur nunc orci, accumsan sodales massa a, dignissim luctus lorem. Praesent tincidunt augue eget tempus auctor.</p>

  <p>Nam rhoncus tincidunt lorem, ac vehicula mauris luctus sit amet. Donec bibendum semper ex, quis condimentum eros elementum id. Morbi id commodo libero, id euismod ipsum. Nullam ante tellus, dapibus ut accumsan ac, pellentesque ut turpis. Quisque ligula nisi, pulvinar id urna id, aliquam laoreet enim. Fusce nec lorem malesuada, dapibus ipsum vel, rhoncus odio. Cras risus tortor, laoreet at odio ac, eleifend rutrum sapien. Sed scelerisque, urna ac iaculis condimentum, odio elit consequat leo, vitae ultricies mi felis eu nibh. Fusce condimentum id diam quis bibendum. Aliquam eget auctor nisi. Suspendisse eleifend sit amet libero at gravida. Cras libero enim, vulputate a nunc non, vulputate bibendum tellus.</p>
</div>

<style>
  form {
    background-color: white;
    padding: 10px;
    border-radius: 5px;
  }
  .content {
    font-size: 18px;
    line-height: 2;
  }
</style>
