try {
  require('@testing-library/jest-dom');
} catch {
  // Optional in this repo; tests can still use standard Jest assertions.
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
