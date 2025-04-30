<script lang="ts">
  import PopupMenuSimple from '../../../test/PopupMenuSimple.svelte'
  const items = [
    { value: 'cat', label: 'Cat', group: 'Animals' },
    { value: 'dog', label: 'Dog', group: 'Animals' },
    { value: 'bear', label: 'Bear', group: 'Animals' },
    { value: 'tiger', label: 'Tiger', group: 'Animals' },
    { value: 'parrot', label: 'Parrot', group: 'Birds' },
    { value: 'eagle', label: 'Eagle', group: 'Birds' },
    { value: 'parakeet', label: 'Parakeet', group: 'Birds' },
    { value: 'salmon', label: 'Salmon', group: 'Fish' },
    { value: 'catfish', label: 'Catfish', group: 'Fish' },
    { value: 'snake', label: 'Snake', group: 'Reptiles' }
  ]
</script>
<PopupMenuSimple {items} showSelected></PopupMenuSimple>
