import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import React, { Component } from 'react';
import importarPontos from './PontosMapa';
import importarChuvas from './DadosAgua';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { Card, Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const data = importarChuvas();  
const pontos = importarPontos();

export class MapContainer extends Component {      
  // Evento que captura o clique para exibir a localizacao
  handleMapClick = (ref, map, ev) => {    
    this.setState({
      x: ev.latLng.lat(),
      y: ev.latLng.lng()
    });        
  };

  /** Renderização do mapa e seus componentes para carregamento no site*/
  render() { 
    document.title = "Mapa Dashboard"      
    return (        
      <div
      style={{
        position: "absolute",
        zIndex: 0,
        width: "100%", 
        height: "100%" 
      }}
    >         
      <Map
        google={this.props.google}
        zoom={4}        
        disableDefaultUI={true}                
        initialCenter={{ lat: -15.3556, lng: -50.6166878 }}                                                    
        onClick={this.handleMapClick}
      >        
            
      <div style={
      {width: "30%", height: "40%",
      zIndex: 1,
      position: "absolute",
      bottom:30,
      right: 10,      
      align: "right"}}> 
        <Accordion defaultActiveKey={['0']} alwaysOpen>
            <Accordion.Item eventKey="0">
            <Accordion.Header>Estatísticas</Accordion.Header>            
            <Accordion.Body>                                
            <BarChart width={350} height={200} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />        
              <Bar dataKey="Chuva" barsize={30} fill="orange" />        
            </BarChart>          
            </Accordion.Body>          
            </Accordion.Item>
          </Accordion>
      </div>
            
      <div style={
      {width: "200px", height: "30px",       
      position: "absolute",
      bottom: 30,
      left: 6,      
      align: "left"}}> 
      <Card>
          <Card.Body>      
            <center>
              <bold>{(this.state.x).toFixed(3)}, {(this.state.y).toFixed(3)}</bold>
              </center>
              </Card.Body>            
      </Card>
        </div>
        {this.exibirMarcadores()}                                        
        </Map>
      </div>          
  );          
  }
  
  constructor(props) {
      super(props);     
    this.state = {
      stores: pontos,
      x: 0,
      y: 0
    }                                   
  }
  
  /** Metodo que carrega os marcadores (pontos do mapa) */
   exibirMarcadores = () => {    
    const svgMarker = {
      path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
      fillColor: "orange",
      fillOpacity: 1,
      strokeWeight: 0,
      rotation: 0,
      scale: 1.0,      
    };
    return this.state.stores.map((store, index) => {      
      return <Marker key={index} id={index} icon={svgMarker} position={{
        lat: store.latitude,
        lng: store.longitude
      }}      
      />            
    })    
  } 

}

/**
 * Exporta o mapa com a chave da API a ser utilizada (que deve estar encapsulada em um arquivo .env)
 */
export default GoogleApiWrapper(
  (props) => ({
    apiKey: 'AIzaSyB79PyGhTLmrpIGqBJSQR4hslwSxcI1UH8',
  }
))(MapContainer)
