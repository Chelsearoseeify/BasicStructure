"use client";

import { Select, Button, Typography } from "antd";
import withTheme from "../../theme";

const Home = function Home() {
  return (
    <>
      <Typography.Title level={2}>
        Ant Design (With Sub Components)
      </Typography.Title>
      <Button type="primary">Click</Button>
    </>
  );
};

const HomePage = () => {
  return withTheme(<Home />);
};

export default HomePage;
