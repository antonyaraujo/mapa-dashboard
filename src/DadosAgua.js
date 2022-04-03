/**
 * Importa dados sobre as chuvas por ano
 * @returns retorna volume das chuvas por ano em um array
 */
function importarChuvas(){    
    const dados = require('./arquivos/year.json');        
            
    var formatado = [];    
    for (let i = 0; i < 11; i++){                        
        var dadosAgua = {};
        var d = new Date(dados['x'][i]);        
        dadosAgua['name'] = (d.getFullYear());
        dadosAgua['Chuva'] = dados['y'][i];        
        formatado.push(dadosAgua);
    }    
            
    return formatado;
}

export default importarChuvas