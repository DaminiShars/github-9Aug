let cheerio=require('cheerio');
let request=require('request');
let path=require('path');
let fs=require('fs');
let xlsx=require('xlsx');
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
        // console.log(teamname);
        
        let tableplayer=searchTool(team[i]).find(".batsman tbody tr");
        for(let j=0;j<tableplayer.length;j++){
            let col=searchTool(tableplayer[j]).find("td");
            if(col.length==8){
                
                let nameP=searchTool(col[0]).text();
                let runs=searchTool(col[2]).text();
                let noOfBalls=searchTool(col[3]).text();
                let Fours=searchTool(col[5]).text();
                let Sixes=searchTool(col[6]).text();
                let strikeRate=searchTool(col[7]).text();
                
                // console.log(nameP,"Played for",teamname,"scored",runs,"runs in", noOfBalls,"balls with",Fours,"Fours and",Sixes,"Sixes with",strikeRate,"Strike Rate");
               // myTeamName name venue date opponentTeamName result runs balls fours sixes sr(strike rate)
               // you'll ve to add venue date opponentTeamName by yourself

               processPLayer(nameP,teamname,runs,noOfBalls,Fours,Sixes,strikeRate);
            }
        }
        console.log("-----------------------------");
        
    }
}
function processPLayer(nameP,teamname,runs,noOfBalls,Fours,Sixes,strikeRate){
// first we'll check team folder exists or not, if not, then we'll make one
    let obj={
        // when key , value pair is same 
        // then instead of writing
        //  "nameP":nameP
        // we can just write
        nameP,
        teamname,
        runs,
        noOfBalls,
        Fours,
        Sixes,
        strikeRate
    }
// now we'll find the path of current directory we are in , in which we have to make team folder
    let dirPath=path.join(__dirname,teamname);
    if(fs.existsSync(dirPath) == false){
        fs.mkdirSync(dirPath);
    }
// secondly, player file exist or not in the teams folder, if not then we'll make one

// playerFile
    let playerFilePath=path.join(dirPath,nameP+".xlsx");
    let playerArr=[];
    if(fs.existsSync(playerFilePath)==false){
        playerArr.push(obj);

    }else{
        // append
        // playerArr=getContent(playerFilePath);
        playerArr=excelReader(playerFilePath,nameP);
        playerArr.push(obj);
    }
    // write in the file
    // writeContent(playerFilePath,playerArr);
    excelWriter(playerFilePath,playerArr,nameP);
}

// function getContent(playerFilePath){
//     // A common use of JSON is to exchange data to/from a web server.
//     // When receiving data from a web server, the data is always a string.
//     // Parse the data with JSON.parse(), and the data becomes a JavaScript object.
//     let content=fs.readFileSync(playerFilePath);
//     return JSON.parse(content);
// }

function writeContent(playerFilePath,content){
    // as we had done json parse while reading, so we'll ve to stringify before writing

    // JSON.stringify()
    // A common use of JSON is to exchange data to/from a web server.
    // When sending data to a web server, the data has to be a string.
    // Convert a JavaScript object into a string with JSON.stringify().
    let jsonData=JSON.stringify(content);
    fs.writeFileSync(playerFilePath,jsonData);
}

//  as we'll be making excel sheets so we'll have to install xlsx in terminal by using command given below
// npm i xlsx
// https://www.npmjs.com/package/xlsx
// the library name is xlsx
// we'll ve to require this lib above 

// A worksheet or sheet is a single page in a file created with an electronic spreadsheet program such as Microsoft Excel or Google Sheets.
//  A workbook is the name given to an Excel file and contains one or more worksheets.
function excelReader(PlayerFilePath,sheetName){
    // player workbook
    let wb=xlsx.readFile(PlayerFilePath);
    // get data from a particular sheet in that wb
    let exceldata=wb.Sheets[sheetName];
    // sheets to json
    // excel format convert -> json data
    let ans=xlsx.utils.sheet_to_json(exceldata);
    return ans;
}

//here we are considering , workbook and worksheet name are same
function excelWriter(FilePath,json,sheetName){
    //json is denoting data here
    //workbook create
    let newwb=xlsx.utils.book_new();
    //worksheet
    let newws=xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newwb,newws,sheetName);
    //excel file write
    xlsx.writeFile(newwb,FilePath);
}

