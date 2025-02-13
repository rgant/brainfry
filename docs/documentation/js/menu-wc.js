'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">brainfry documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/ActionsComponent.html" data-type="entity-link" >ActionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AuthErrorMessagesComponent.html" data-type="entity-link" >AuthErrorMessagesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CentralLayoutComponent.html" data-type="entity-link" >CentralLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChangeEmailComponent.html" data-type="entity-link" >ChangeEmailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChangePasswordComponent.html" data-type="entity-link" >ChangePasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ConfirmEmailComponent.html" data-type="entity-link" >ConfirmEmailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardComponent.html" data-type="entity-link" >DashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DeleteAccountComponent.html" data-type="entity-link" >DeleteAccountComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FooterComponent.html" data-type="entity-link" >FooterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ForgotPasswordComponent.html" data-type="entity-link" >ForgotPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LogoutComponent.html" data-type="entity-link" >LogoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PageNotFoundComponent.html" data-type="entity-link" >PageNotFoundComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PhotoManagerComponent.html" data-type="entity-link" >PhotoManagerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PhotoUploadComponent.html" data-type="entity-link" >PhotoUploadComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PrivacyPolicyComponent.html" data-type="entity-link" >PrivacyPolicyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/QuizEditorComponent.html" data-type="entity-link" >QuizEditorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/QuizListComponent.html" data-type="entity-link" >QuizListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/QuizPresenterComponent.html" data-type="entity-link" >QuizPresenterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RecoverEmailComponent.html" data-type="entity-link" >RecoverEmailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ResetPasswordComponent.html" data-type="entity-link" >ResetPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SidebarComponent.html" data-type="entity-link" >SidebarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SpinnerComponent.html" data-type="entity-link" >SpinnerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StandardLayoutComponent.html" data-type="entity-link" >StandardLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TermsAndConditionsComponent.html" data-type="entity-link" >TermsAndConditionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserProfileComponent.html" data-type="entity-link" >UserProfileComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VerifyEmailComponent.html" data-type="entity-link" >VerifyEmailComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AppTitleStrategyService.html" data-type="entity-link" >AppTitleStrategyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/QuizService.html" data-type="entity-link" >QuizService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RecoverEmailService.html" data-type="entity-link" >RecoverEmailService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ResetPasswordService.html" data-type="entity-link" >ResetPasswordService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserPhotosService.html" data-type="entity-link" >UserPhotosService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VerifyEmailService.html" data-type="entity-link" >VerifyEmailService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ActionCodeState.html" data-type="entity-link" >ActionCodeState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApplyResult.html" data-type="entity-link" >ApplyResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CombinedObs.html" data-type="entity-link" >CombinedObs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ControlProperties.html" data-type="entity-link" >ControlProperties</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ControlStruct.html" data-type="entity-link" >ControlStruct</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PasswordResetSuccess.html" data-type="entity-link" >PasswordResetSuccess</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Photo.html" data-type="entity-link" >Photo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Progress.html" data-type="entity-link" >Progress</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Quiz.html" data-type="entity-link" >Quiz</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/QuizModel.html" data-type="entity-link" >QuizModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/QuizPayload.html" data-type="entity-link" >QuizPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RecoverEmailResults.html" data-type="entity-link" >RecoverEmailResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShowForm.html" data-type="entity-link" >ShowForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerifiedFailed.html" data-type="entity-link" >VerifiedFailed</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerifyEmailResult.html" data-type="entity-link" >VerifyEmailResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ViewModel.html" data-type="entity-link" >ViewModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ViewModel-1.html" data-type="entity-link" >ViewModel</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});