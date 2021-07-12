import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import PopupMenuSimple from './PopupMenuSimple.svelte'
window.HTMLElement.prototype.scrollIntoView = function () {}

test('menu toggles when button is clicked', async () => {
  const { findByTestId, queryByText } = render(PopupMenuSimple)
  const button = await findByTestId('button')
  expect(queryByText('Monday')).not.toBeInTheDocument()
  userEvent.click(button)
  await waitFor(() => expect(queryByText('Monday')).toBeInTheDocument())
  userEvent.click(button)
  await waitFor(() => expect(queryByText('Monday')).not.toBeInTheDocument())
})

test('has five menu items', async () => {
  const { findByTestId, queryByText } = render(PopupMenuSimple)
  const button = await findByTestId('button')
  userEvent.click(button)
  await waitFor(() => {
    expect(queryByText('Monday')).toBeInTheDocument()
    expect(queryByText('Tuesday')).toBeInTheDocument()
    expect(queryByText('Wednesday')).toBeInTheDocument()
    expect(queryByText('Thursday')).toBeInTheDocument()
    expect(queryByText('Friday')).toBeInTheDocument()
  })
})

test('clicking a menu option selects it', async () => {
  const { findByTestId, findByText, queryByText } = render(PopupMenuSimple)
  const button = await findByTestId('button')
  userEvent.click(button)
  const option = await findByText('Monday')
  userEvent.click(option)
  await waitFor(() => expect(queryByText('selected: 1', { exact: false })).toBeInTheDocument())
})

test('may select a menu option with the keyboard', async () => {
  const { findByTestId, findByText, queryByText } = render(PopupMenuSimple)
  const button = await findByTestId('button')
  userEvent.click(button)
  await findByText('Monday')
  userEvent.type(button, '{arrowdown}{enter}')
  await waitFor(() => expect(queryByText('selected: 1', { exact: false })).toBeInTheDocument())
})
