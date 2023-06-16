import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Buffer } from "buffer";
import { BehaviorSubject } from 'rxjs/';
import { AzureDevopsAPIService } from '../services/azure-devops-api.service';
import { ChatbotComponent } from './chatbot.component';

@Injectable({
  providedIn: 'root'
})

export abstract class ParsingHandler {

    static devopsService: AzureDevopsAPIService;

    static parseResponse(commandQuery: string, query) {
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(commandQuery);
        console.log(parsedResponse);
      // Si hay un error parseando la respuesta del bot, significa que no regresó un JSON y por lo tanto
      // se imprime directamente en el chat sin procesarla
      } catch (error) {
        return null;
      }
      console.log(commandQuery);
      return parsedResponse;
    }
    
    //
    static parseCalendarEventResponse(data): string{
        let stringResult: string = '';
        // Vamos almacenando los datos de cada valor del objeto obtenido por el request en un string
        data.value.forEach(function (item) {
            // Concatenamos los datos que nos interesan. OJO. Probablemente lo que haremos es separar la fecha y la hora.
            const eachResultString = '📂 Subject: ' + item.subject + '\n📝 Description: ' 
            + item.bodyPreview + '\n📅 Date and Time: ' + item.start['dateTime'] + '\n🔗 Link: ' + item.webLink + '\n';
            stringResult = stringResult + eachResultString + '\n';
        });
        return stringResult;
    }

    processFindMeetingTimeWhenCreatingEvent(data){

    }

    //
    static parseEmailsResponse(data): string{
      let stringResult: string = '';
        
        // Vamos almacenando los datos de cada valor del objeto obtenido por el request en un string
        data.value.forEach(function (item) {
            let eachResultString: string;
            // Concatenamos los datos que nos interesan. OJO. Probablemente lo que haremos es separar la fecha y la hora.
            if(item.hasOwnProperty("sender")){
              eachResultString = '📂 Subject: ' + item.subject + '\n👤 Sender name: ' + item.sender.emailAddress.name + '\n📧 Sender address: ' + item.sender.emailAddress.name  + '\n';
            }
  
            stringResult = stringResult + eachResultString + '-----------------------------------------------------\n';
          });

        return stringResult;
    }


    // Falta incluirse en el método processAzureDevOpsRequest
    static processAndParseWIQLResponse(data, requestLink: string): string{
      let stringResult: string = '';

        // Hacer for que recorre los workitems y los almacena en un string bonito :)
        data.value.forEach(function (item) {
            const eachResultString = '🆔 ID: ' + item.id + '\n📂 Title: ' + item.fields['System.Title'] + '\n🔲 Work item type: ' 
            + item.fields['System.WorkItemType'] + '\n👤 Assigned to: ' + item.fields['System.AssignedTo'].displayName + '\n❔ State: ' + item.fields['System.State'] +'\n🔗 Link: ' + requestLink + "/_workitems/edit/" + item.id + '\n';
            stringResult = stringResult + eachResultString + '-----------------------------------------------------\n';
        });

        return stringResult;
    }

    //
    static processSimpleWorkItemResponse(data, requestLink: string): string{
      let stringResult: string = '';

      stringResult = "🆔 ID: " + data.id + "\n📂 Title: " + data.fields['System.Title'] + "\n🔲 Work item type: " + data.fields['System.WorkItemType'] + 
      "\n👤 Created By: " + data.fields['System.CreatedBy'].displayName + '\n❔ State: ' + data.fields['System.State'] + '\n🔗 Link: ' + requestLink + "/_workitems/edit/" + data.id;

      return stringResult;
    }

    //
    static processActivitiesResponse(data, requestLink: string): string{

      let stringResult: string = '';

        data.value.forEach(function (item) {
          if(item.activityType != "visited"){
            const eachResultString = '🆔 ID: ' + item.id + '\n📂 Title: ' + item.title + '\n🔲 Work item type: ' + item.workItemType + 
            '\n🔳 Activity Type: ' + item.activityType + '\n📅 Activity Date: ' + item.activityDate + '\n🔗 Link: ' + requestLink + "/_workitems/edit/" + data.id + '\n';

            stringResult = stringResult + eachResultString + '-----------------------------------------------------\n';
          }
        });

      return stringResult;
    }


    static processDevOpsMembers(data): string{

      let stringResult: string = '';

      data.value.forEach(function (value) {
        const eachResultString = '👤 Name: ' + value.displayName + '\n📧 E-mail address: ' + value.mailAddress + '\n';

        stringResult = stringResult + eachResultString + '-----------------------------------------------------\n';
      });

      return stringResult;
    
    }


}