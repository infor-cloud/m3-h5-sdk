import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [{ path: "", redirectTo: "/soho", pathMatch: "full" }];

@NgModule({
   imports: [RouterModule.forRoot(routes, { useHash: true })],
   exports: [RouterModule],
})
export class AppRoutingModule {}
