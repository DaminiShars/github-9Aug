let cheerio=require('cheerio');
let request=require('request');
let path=require('path');
let fs=require('fs');
const { Console } = require('console');
let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";
request(url,cb);
function cb(error,response,html){
    if(error){
        console.log(error);
    }else if(response.statusCode == 404){
        console.log("Page cannot be found");
    }else{
        dataExtractor(html);
    }
}
function dataExtractor(html){
    let searchTool=cheerio.load(html);
    let aelm=searchTool('a[data-hover="View All Results"]');
    let lastlink=aelm.attr("href");
    let fulllink= `https://www.espncricinfo.com${lastlink}`;
    console.log("fulllink :",fulllink);
    request(fulllink,newcb);
}
function newcb(error,response,html){
    if(error){
        console.log(error);
    }else if(response.statusCode == 404){
        console.log("Page not found");
    }else{
        dataExtractor2(html);
    }
}
function dataExtractor2(html){
    let searchTool=cheerio.load(html);
    let allMatches=searchTool("a[data-hover='Scorecard']");
    console.log("--------------------------------------------------");
    for(let i=0;i<allMatches.length;i++){
        let lastlink=searchTool(allMatches[i]).attr("href");
        let fulllink=`https://www.espncricinfo.com${lastlink}`;
        console.log("fulllink2 :", fulllink);
        request(fulllink,newcb2);
    }
}
function newcb2(error,response,html){
    if(error){
        console.log(error);
    }else if(response.statusCode==404){
        console.log("Page not found");
    }else{
        dataExtractor3(html);
    }
}
function dataExtractor3(html){
    let searchTool=cheerio.load(html);
    let team=searchTool(".Collapsible");
    let content="";
    for(let i=0;i<team.length;i++){
        // content=searchTool(team[i]).html();
        let teamnameElem=searchTool(team[i]).find("h5");
        let teamname=searchTool(teamnameElem).text();
        teamname=teamname.split("INNINGS")[0];
        teamname=teamname.trim();
        console.log(teamname);
        
        let tableplayer=searchTool(team[i]).find(".batsman tbody tr");
        for(let j=0;j<tableplayer.length;j++){
            let col=searchTool(tableplayer[j]).find("td");
            if(col.length==8){
                let nameP=searchTool(col[0]).text();
                
                console.log(nameP);
               
            }
        }
        console.log("-----------------------------");
        
    }
    

}
