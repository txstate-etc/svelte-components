import { storiesOf } from '@storybook/svelte'
import Offset from './Offset.svelte'
import Resize from './Resize.svelte'

storiesOf('Actions', module)
  .add('offset', () => ({
    Component: Offset
  }))
  .add('offset debounced', () => ({
    Component: Offset,
    props: { debounce: true }
  }))
  .add('resize', () => ({
    Component: Resize
  }))
  .add('resize debounced', () => ({
    Component: Resize,
    props: { debounce: true }
  }))
