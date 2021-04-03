import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/svelte'

import PopupMenuTest from './PopupMenuTest.svelte'

test('menu toggles when button is clicked', async () => {
  const { getByTestId, queryByText } = render(PopupMenuTest)
  const button = await getByTestId('button')
  expect(queryByText('Monday')).not.toBeInTheDocument()
  button.click()
  await waitFor(() => expect(queryByText('Monday')).toBeInTheDocument())
  button.click()
  await waitFor(() => expect(queryByText('Monday')).not.toBeInTheDocument())
})

test('has five menu items', async () => {
  const { getByTestId, queryByText } = render(PopupMenuTest)
  const button = await getByTestId('button')
  button.click()
  await waitFor(() => {
    expect(queryByText('Monday')).toBeInTheDocument()
    expect(queryByText('Tuesday')).toBeInTheDocument()
    expect(queryByText('Wednesday')).toBeInTheDocument()
    expect(queryByText('Thursday')).toBeInTheDocument()
    expect(queryByText('Friday')).toBeInTheDocument()
  })
})
