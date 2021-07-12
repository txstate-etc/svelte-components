import { storiesOf } from '@storybook/svelte'
import ModalTest from './ModalTest.svelte'

storiesOf('Modal', module)
  .add('simple modal example', () => ({
    Component: ModalTest,
    props: {}
  }))
