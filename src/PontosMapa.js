/**
 * Importa os pontos do arquivo
 * Filtra para exibir apenas os pontos que possui relacao com o Brasil
 * @returns um array com os pontos filtrados
 */
function importarPontos(){    
    const arquivo = require('./arquivos/location.json');        
    
    var tamanho = arquivo['features'].length    
    var pontos = []        
    var dados = arquivo['features'][0];
    for(let i = 0; i < tamanho; i++){
        if(arquivo['features'][i]['properties']['responsible'] === 'RHNR'){
            dados = arquivo['features'][i]            
            var ponto = {};
            ponto['longitude'] =  dados['geometry']['coordinates'][0];
            ponto['latitude'] =  dados['geometry']['coordinates'][1];
            ponto['local'] = dados['properties']['country'];
            pontos.push(ponto)
        }
    }
    
    return pontos;
}

export default importarPontos