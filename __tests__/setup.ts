// Setup file for vitest — ensures React is available globally for JSX transforms
import React from "react";
(globalThis as any).React = React;
