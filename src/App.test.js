import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

jest.mock('./components/CodeEditor', () => function MockCodeEditor() {
  return <div aria-label="Code diff editor" />;
});

test('renders CodeDiff application shell', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<App />);
  });

  expect(document.querySelector('[aria-label="Code diff editor"]')).toBeTruthy();

  await act(async () => {
    root.unmount();
  });
  document.body.removeChild(container);
});
