import React from 'react';
import { ChakraProvider, Flex, CSSReset, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Header, Sidebar, MainContent } from './components/layout/';
import LandingPage from './pages/LandingPage';
import {
  AccountPage,
  LoginPage,
  OrganisationPage,
  RegisterPage,
} from './pages/auth/';
import { FeedPage } from './pages/feed/';
import { TasksPage } from './pages/tasks/';
import { ViewsPage, ViewDetailPage } from './pages/views/';
import { ObjectsPage, ObjectDetailPage } from './pages/object/';
import {
  SettingsPage,
  ObjectTypesPage,
  FunnelsPage,
  ListsPage,
  TagsPage,
} from './pages/settings/';
import NoPermissionPage from './pages/NoPermissionPage';
import ProtectedRoute from './components/ProtectedRoute';
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
          <Route exact path='/no-permission' component={NoPermissionPage} />
          <Route>
            <Flex direction='column' minH='100vh'>
              <Header />
              <Flex flex={1}>
                <Sidebar />
                <MainContent>
                  <Switch>
                    <ProtectedRoute exact path='/feed' component={FeedPage} />
                    <ProtectedRoute exact path='/tasks' component={TasksPage} />
                    <ProtectedRoute exact path='/views' component={ViewsPage} />
                    <ProtectedRoute
                      exact
                      path='/views/:id'
                      component={ViewDetailPage}
                    />
                    <ProtectedRoute
                      exact
                      path='/objects'
                      component={ObjectsPage}
                    />
                    <ProtectedRoute
                      exact
                      path='/objects/:id'
                      component={ObjectDetailPage}
                    />
                    <ProtectedRoute
                      exact
                      path='/settings'
                      component={SettingsPage}
                    />
                    <ProtectedRoute
                      exact
                      path='/settings/object-types'
                      component={ObjectTypesPage}
                    />
                    <ProtectedRoute
                      exact
                      path='/settings/funnels'
                      component={FunnelsPage}
                    />
                    <ProtectedRoute
                      exact
                      path='/settings/lists'
                      component={ListsPage}
                    />
                    <ProtectedRoute
                      exact
                      path='/settings/tags'
                      component={TagsPage}
                    />
                    <ProtectedRoute
                      exact
                      path='/account'
                      component={AccountPage}
                    />
                    <ProtectedRoute
                      exact
                      path='/organisation'
                      component={OrganisationPage}
                      requiredRole='admin'
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
