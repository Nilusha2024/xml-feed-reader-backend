import express, { Request, Response } from "express";
import http from "http";
import io from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import { AusCompetitor } from "./model/aus-competitor";
import { EngCompetitor } from "./model/eng-competitor";
import moment from 'moment';

const app = express();
const server = new http.Server(app);
const socketIO = io(server);

const jsonParser = bodyParser.json();

app.use(
  cors({
    credentials: true,
    origin: "http://172.16.10.49:80",
  })
);

app.post("/data", jsonParser, (req: Request, res: Response) => {
  if (req.body.category) {
    try {
      let competition = req.body.category.competition;
      if (competition) {
          let competitors = competition.event.market.competitor;
          let results = competition.event.market.result;
        
          let currentRunners = parseInt(
            competition.event.market["-currentrunners"]
          );
          let description = competition.event["-description"];
          let notRunners: number[] = [];
          let type = req.body.category["-category"];
          let racedate = req.body.category["-date"];
          let racedescription = competition['-racedescription'];
          competitors = competitors
            .map((c: any) => {
              let map = new Map();
              map.set("number", c["-number"]);
              map.set("name", c["-name"]);
              map.set("status", c["-status"]);
              c["-silkid"] && map.set("silk", c["-silkid"]);
              if (map.get("status") === "NR") {
                notRunners.push(parseInt(map.get("number")));
              }
              c.price.forEach((p: any) => {
                map.set(p["-pricetype"], parseFloat(p["-odds"]));
              });
              return new AusCompetitor(
                parseFloat(map.get("number")),
                map.get("name"),
                map.get("status"),
                map.get("silk"),
                parseFloat(map.get("WIN")),
                parseFloat(map.get("PLC")),
                0
              );
            })
            .filter((c: AusCompetitor) => {
              return c.status !== "NR";
            });
            console.log(competition.event["-mtp"]);
          if(results){
            socketIO.emit("aus-result", {
              competitors,
              notRunners,
              type,
              id: req.body.category["-id"],
              track: competition["-racedescription"],
              weather: competition.event["-going"],
              mtp: parseInt(competition.event["-mtp"]),
              currentRunners,
              description,
              country: competition.event["-countrycode"],
              source: "aus-feed",
              racedate,
              results,
              racedescription
            });
          } else {
            socketIO.emit(competition.event["-status"], {
              competitors,
              notRunners,
              type,
              id: req.body.category["-id"],
              track: competition["-racedescription"],
              weather: competition.event["-going"],
              mtp: parseInt(competition.event["-mtp"]),
              currentRunners,
              description,
              country: competition.event["-countrycode"],
              source: "aus-feed",
              racedate,
              status: '', 
              racedescription
            });
          }
        
      }
      res.json(true);
    } catch (error) {
      socketIO.emit("error", error);
      res.json(false);
    }
  } else if (req.body.data) {
    let racedate = req.body.data["-date"];
    var date = moment().format('Y-M-D');
      
      if(racedate == date){
        socketIO.emit("eng-nilusha", req.body.data);
      }
    try {
      let meeting = req.body.data.meeting;
      let racedate = req.body.data["-date"];
      var racetime = req.body.data.meeting.event["-time"];
      var date = moment().format('Y-M-D');
      var time = moment().format('h:mm:ss');    
      var offtime = req.body.data.meeting.event["-offTime"]
      if (meeting && racedate == date) {
        var ms = moment(time,"HH:mm:ss").diff(moment(racetime,"HH:mm:ss"));
        let minute = ms/60000;
    
          let competitors = meeting.event.selection;
          let results = meeting.event.result;
          
          let currentRunners = parseInt(competitors.length);
          let description = meeting["-name"];
          let notRunners: number[] = [];
          let type = req.body.data["-category"];

          competitors = competitors.map((c: any) => {
            let map = new Map();
            map.set("number", c["-num"]);
            map.set("name", c["-name"]);
            map.set("status", c["-status"]);
            c["-silkCode"] && map.set("silk", c["-silkCode"]);
            if (map.get("status") === "N") {
              notRunners.push(parseInt(map.get("num")));
            }

            let prices: Array<String> = [];
            c.price
              .filter((f: any) => f["-mkttype"] == "B")
              .sort((a: any, b: any) => a["-time"] - b["-time"])
              .forEach((p: any) => {
                prices.push(p["-fract"]);
              });
            prices = prices.reverse().slice(0, 3).reverse();
            return new EngCompetitor(
              parseFloat(map.get("number")),
              map.get("name"),
              map.get("status"),
              map.get("silk"),
              prices,
              1
            );
          });

          if (results) {
            socketIO.emit("eng-result", {
              competitors,
              notRunners,
              type,
              id: req.body.data.meeting.event["-id"],
              track: meeting.event["-name"],
              weather: "",
              mtp: minute, // todo: replace with mtp
              currentRunners,
              description,
              country: req.body.data["-country"],
              source: "eng-feed",
              racedate,
              status: meeting.event["-going"], 
              results,
              offtime
            });
          } else {
            socketIO.emit("open", {
              competitors,
              notRunners,
              type,
              id: req.body.data.meeting.event["-id"],
              track: meeting.event["-name"],
              weather: "",
              mtp: minute, // todo: replace with mtp
              currentRunners,
              description,
              country: req.body.data["-country"],
              source: "eng-feed",
              racedate,
              status: meeting.event["-going"], 
              offtime
            });
          }
      }
      res.json(true);
    } catch (error) {
      socketIO.emit("error", error);
      res.json(false);
    }
  } else if (req.body.races) {
    socketIO.emit("races", req.body.races.race);
    res.json(true);
  } else {
    res.json(false);
  }
});

socketIO.on("connection", (socket: io.Socket) => {
  socket.emit("connection", "connection established");
});

server.listen(4000, "0.0.0.0", () => {
  console.log("listening on 4000");
});
