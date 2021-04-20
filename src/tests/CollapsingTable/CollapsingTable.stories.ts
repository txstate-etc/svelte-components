import { storiesOf } from '@storybook/svelte'
import CollapsingTableTest from './CollapsingTableTest.svelte'

storiesOf('CollapsingTable', module)
  .add('simple collapsing table', () => ({
    Component: CollapsingTableTest
  }))
  .add('with sticky header', () => ({
    Component: CollapsingTableTest,
    props: {
      stickyheader: true
    }
  }))
