import React, {useState, useEffect} from 'react';
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { 
  MenuItem,
  FormControl,
  Select,
  Card, CardContent
 } from "@material-ui/core";
 import { prettyPrintStat, sortData } from "./Util";
 import LineGraph from './LineGraph';
 import "leaflet/dist/leaflet.css";
import './App.css';

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] =
   useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [caseType, setCaseType] = useState("cases");


  // useEffect -> Runs a piece a code based on a given condition
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
      
    });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
      });
    }

    getCountriesData();
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode); // Update the input field
      setCountryInfo(data); // Store the countries information into a variable

      countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      
      setMapZoom(5);
    })
  }
  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
      <h1>COVID 19 TRACKER</h1>
        <FormControl className="app__dropdown">
          <Select variant="outlined" onChange={onCountryChange} value={country}>
          <MenuItem value="worldwide">Worldwide</MenuItem>
             {countries.map((country) => (
               <MenuItem value={country.value}>{country.name}</MenuItem>
             ))}
          </Select>
        </FormControl>
      </div>
      
      <div className="app__stats">
          <InfoBox 
          isRed
          active={caseType === "cases"}
          onClick={(e) => setCaseType('cases')}
          title="Coronavirus cases" 
          cases={prettyPrintStat(countryInfo.todayCases)} 
          total={prettyPrintStat(countryInfo.cases)} 
          />
          <InfoBox 
          active={caseType === "recovered"}
          onClick={(e) => setCaseType('recovered')}
          title="Recovered" 
          cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={prettyPrintStat(countryInfo.cases)} 
          />
          <InfoBox 
          isRed
          active={caseType === "deaths"}
          onClick={(e) => setCaseType('deaths')}
          title="Deaths" 
          cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={prettyPrintStat(countryInfo.cases)} 
          />
      </div>
        
      <Map casesType={caseType} countries={mapCountries} center={mapCenter}
      zoom={mapZoom} />
      </div>
      <Card className="app__right">
          <CardContent>
            <h3>Live Cases By Country</h3>
            <Table countries={tableData} />
             <h3>World new {caseType}</h3>
            <LineGraph casesType={caseType} />
          </CardContent>
      </Card>
      {/* Table */}
      {/* Graph */}

      {/* Map */}

    </div>
  );
}

export default App;
