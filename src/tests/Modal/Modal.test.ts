import '@testing-library/jest-dom'
import { render, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import ModalTest from './ModalTest.svelte'

test('modal is active on first render, escape dismisses, clicking the button brings it back, escaping puts focus on the button', async () => {
  const { findByLabelText, findByTestId, queryByText } = render(ModalTest)
  const button = await findByTestId('button')
  let nameInput = await findByLabelText('First Name:')
  userEvent.type(nameInput, '{esc}')
  await waitFor(() => expect(queryByText('First Name:')).not.toBeInTheDocument())
  userEvent.click(button)
  nameInput = await findByLabelText('First Name:')
  userEvent.type(nameInput, '{esc}')
  await waitFor(() => expect(button).toHaveFocus())
})
