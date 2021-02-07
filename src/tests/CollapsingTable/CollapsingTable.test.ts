import '@testing-library/jest-dom'
import { render } from '@testing-library/svelte'

import TestTable from './CollapsingTableTest.svelte'

test('has two rows in tbody', () => {
  const { getByText } = render(TestTable)

  expect(getByText('John Smith')).toBeInTheDocument()
  expect(getByText('Mary Sue')).toBeInTheDocument()
})
