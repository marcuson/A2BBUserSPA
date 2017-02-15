import { A2BBUserSPAPage } from './app.po';

describe('a2-bbuser-spa App', function() {
  let page: A2BBUserSPAPage;

  beforeEach(() => {
    page = new A2BBUserSPAPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
