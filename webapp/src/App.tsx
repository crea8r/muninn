import React from 'react';
import { ChakraProvider, Flex, CSSReset, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import TasksPage from './pages/TasksPage';
import ViewsPage from './pages/ViewsPage';
import ViewDetailPage from './pages/ViewDetailPage';
import ObjectsPage from './pages/ObjectsPage';
import SettingsPage from './pages/SettingsPage';
import ObjectTypesPage from './pages/settings/ObjectTypesPage';
import FunnelsPage from './pages/settings/FunnelsPage';
import ListsPage from './pages/settings/ListsPage';
import TagsPage from './pages/settings/TagsPage';
import ObjectDetailPage from './pages/ObjectDetailPage';
import AccountPage from './pages/AccountPage';
import OrganisationPage from './pages/OrganisationPage';
import './styles/tailwind.css';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  colors: {
    brand: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      tertiary: 'var(--color-tertiary)',
      accent1: 'var(--color-accent-1)',
      accent2: 'var(--color-accent-2)',
    },
  },
});

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Router>
        <Switch>
          <Route exact path='/' component={LandingPage} />
          <Route exact path='/login' component={LoginPage} />
          <Route exact path='/register' component={RegisterPage} />
          <Route>
            <Flex direction='column' minH='100vh'>
              <Header />
              <Flex flex={1}>
                <Sidebar />
                <MainContent>
                  <Switch>
                    <Route exact path='/feed' component={FeedPage} />
                    <Route exact path='/tasks' component={TasksPage} />
                    <Route exact path='/views' component={ViewsPage} />
                    <Route exact path='/views/:id' component={ViewDetailPage} />
                    <Route exact path='/objects' component={ObjectsPage} />
                    <Route
                      exact
                      path='/objects/:id'
                      component={ObjectDetailPage}
                    />
                    <Route exact path='/settings' component={SettingsPage} />
                    <Route
                      exact
                      path='/settings/object-types'
                      component={ObjectTypesPage}
                    />
                    <Route
                      exact
                      path='/settings/funnels'
                      component={FunnelsPage}
                    />
                    <Route exact path='/settings/lists' component={ListsPage} />
                    <Route exact path='/settings/tags' component={TagsPage} />
                    <Route exact path='/account' component={AccountPage} />
                    <Route
                      exact
                      path='/organisation'
                      component={OrganisationPage}
                    />
                  </Switch>
                </MainContent>
              </Flex>
            </Flex>
          </Route>
        </Switch>
      </Router>
    </ChakraProvider>
  );
};

export default App;
