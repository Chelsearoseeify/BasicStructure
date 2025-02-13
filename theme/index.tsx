"use client";

import React, { JSX } from "react";
import { ConfigProvider } from "antd";

const withTheme = (node: JSX.Element) => (
  <>
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 2,
          colorPrimary: "#00b96b",
        },
      }}
    >
      {node}
    </ConfigProvider>
  </>
);

export default withTheme;
