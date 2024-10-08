import { ThemeProvider } from "@emotion/react";
import theme from "./constants/theme";
import MainLayout from "./layout/MainLayout";
import "./styles/index.less";

function App() {
	return (
		<ThemeProvider theme={theme}>
			<MainLayout />
		</ThemeProvider>
	);
}

export default App;
