import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms'; // ✅ Dodaj ovo
import { routes } from './app.routes';

export const appConfig = {
  providers: [
    provideHttpClient(), 
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(FormsModule) // ✅ I ovo dodaj
  ]
};
