import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/svelte'

import TestTable from './CollapsingTableTest.svelte'

test('has two rows in tbody', async () => {
  const { getByText } = render(TestTable)

  expect(getByText('John Smith')).toBeInTheDocument()
  expect(getByText('Mary Sue')).toBeInTheDocument()
})

test('hides the numerated columns on a small screen', async () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 })
  const { queryByText } = render(TestTable)
  expect(queryByText('one')).not.toBeInTheDocument()
})

test('menu toggles when button is clicked', async () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 })
  const { queryByText, findByRole } = render(TestTable)
  const button = await findByRole('button')
  expect(queryByText('two')).not.toBeInTheDocument()
  button.click()
  await waitFor(() => expect(queryByText('two')).toBeInTheDocument())
  button.click()
  await waitFor(() => expect(queryByText('two')).not.toBeInTheDocument())
})

test('able to activate a new row', async () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 })
  const { queryAllByText, findByRole, findByText } = render(TestTable)
  const button = await findByRole('button')
  button.click()
  const menuitem = await findByText('two')
  menuitem.click()
  await waitFor(() => expect(queryAllByText('2').length).toBeGreaterThan(0))
})
