import { Injectable } from '@angular/core';


interface frequentQuestion {
  shortQuestion: string;
  query: string;
}

@Injectable({
  providedIn: 'root'
})

export class ManageFaqService {

  public frequentQuestions : frequentQuestion[];

  constructor() { }
  ngOnInit(): void{
    this.frequentQuestions = [
      // "query" es el target
      { shortQuestion: "Codigo de Vestimenta", query: "asdf"},
      { shortQuestion: "Juntas", query: "fdsa"},
      { shortQuestion: "Tasks", query: "tyty"},
    ];
  }
}
