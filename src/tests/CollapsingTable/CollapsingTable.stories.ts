import { storiesOf } from '@storybook/svelte'
import CollapsingTableTest from './CollapsingTableTest.svelte'

storiesOf('CollapsingTable', module)
  .add('simple component example', () => ({
    Component: CollapsingTableTest,
    data: {},
    on: {}
  }))
