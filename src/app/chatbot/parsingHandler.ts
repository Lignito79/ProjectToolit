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

export abstract class parsingHandler {

    static devopsService: AzureDevopsAPIService;
    
    //
    static parseCalendarEventResponse(data): string{
        let stringResult: string;
        // Vamos almacenando los datos de cada valor del objeto obtenido por el request en un string
        data.value.forEach(function (item) {
            // Concatenamos los datos que nos interesan. OJO. Probablemente lo que haremos es separar la fecha y la hora.
            const eachResultString = 'Subject: ' + item.subject + ', Description: ' + item.bodyPreview + ', Date and Time: ' + item.start['dateTime'] + '\n';
            stringResult = stringResult + eachResultString + '\n';
        });
        return stringResult;
    }

    processFindMeetingTimeWhenCreatingEvent(data){

    }

    //
    static parseEmailsResponse(data): string{
        let stringResult: string;
        
        // Vamos almacenando los datos de cada valor del objeto obtenido por el request en un string
        data.value.forEach(function (item) {
            let eachResultString: string;
            // Concatenamos los datos que nos interesan. OJO. Probablemente lo que haremos es separar la fecha y la hora.
            if(item.hasOwnProperty("sender")){
              eachResultString = 'Subject: ' + item.subject + ', Sender name: ' + item.sender.emailAddress.name + ', Sender address: ' + item.sender.emailAddress.name  + '\n';
            }
  
            stringResult = stringResult + eachResultString + '\n';
          });

        return stringResult;
    }


    // Falta incluirse en el método processAzureDevOpsRequest
    static processAndParseWIQLResponse(data): string{
        
        let stringResult: string;

        // Hacer for que recorre los workitems y los almacena en un string bonito :)
        data.value.forEach(function (item) {
            const eachResultString = 'ID: ' + item.id + ', Title: ' + item.fields['System.Title'] + ', Work item type: ' + item.fields['System.WorkItemType'] + '\n';
            stringResult = stringResult + eachResultString + '\n';
        });

        return stringResult;
    }

    //
    static processSimpleWorkItemResponse(data): string{

        let stringResult: string;

        stringResult = "ID: " + data.id + ", Title: " + data.fields['System.Title'] + ", Work item type: " + data.fields['System.WorkItemType'] + 
        ", Created By: " + data.fields['System.CreatedBy'].displayName;

        return stringResult;
    }

    //
    static processActivitiesResponse(data): string{

      let stringResult: string;

      const resultsBatch = data.value.map(item => ({
          id: item.id,
          title: item.title,
          activityType: item.activityType,
          activityDate: item.activityDate,
          workItemType: item.workItemType
        }));

        resultsBatch.forEach(function (value) {
          if(value.activityType != "visited"){
            const eachResultString = 'ID: ' + value.id + ', Title: ' + value.title + ', Work item type: ' + value.workItemType + 
            ', Activity Type: ' + value.activityType + ', Activity Date: ' + value.activityDate + '\n';

            stringResult = stringResult + eachResultString + '\n';
          }
        });

      return stringResult;
    }


    static processDevOpsMembers(data): string{

      let stringResult = "";

      data.value.forEach(function (value) {
        const eachResultString = 'Name: ' + value.displayName + ', E-mail address: ' + value.mailAddress + '\n';

        stringResult = stringResult + eachResultString + '\n';
      });

      return stringResult;
    
    }


}