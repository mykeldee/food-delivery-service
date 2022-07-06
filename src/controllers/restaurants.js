const {menu,restaurants} = require('../models/restaurants');

const menuController = {
    getItem: (request,response) => {
        if ( Object.keys(request.query).length === 0){
            console.log(menu.find().all())
            response.status(401);
            response.json({
                success:false
            });
        }else{
            const item = request.query.item
            menu.findOne( { where: { item } })
            .then(menuItem => {
                 if(menuItem === null || menuItem === undefined){
                     response.status(401);
                     response.json({
                         success:false,
                         message: item + " was not found"
                     })
                }else{
                    response.status(201);
                    response.json({
                        success:true,
                        data:{
                            menu:menuItem
                        }
                    })           
                }
            })
        }
        console.log(request.query);
        return response;
    },
    addItem: (request, response) => {
        const menuData = {};
        
        if (request.body.item !== undefined && request.body.item !== '' ){
            menuData.item = request.body.item
        }
        if (request.body.item_price !== undefined && request.body.item_price !== '' ){
            menuData.item_price = request.body.item_price
        }

        if(Object.keys(menuData).length === 2){
            
            menu.create(menuData)
            .then( (result) => {
            response.status(201);
            response.json({
                success: true,
                message: 'menu created successfully',
                data: {
                item: menuData,
                },
            });
            return response;
            })

        }else{
            if(Object.keys(menuData).length === 2){
            
            response.status(401);
            response.json({
                success: false,
                message: 'something went wrong.\n',
            });

            return response;
            }
        }
    }
}

const restaurantController = {
    getRestaurants: (request,response) => {
        restaurants.find()
        .then( (result) => {
        response.status(201);
        response.json({
            success: true,
            message: `There are ${result.length} restaurants in total`,
            data: {
            restaurants: result,
            },
        });
        console.log('===>',result.length)
        return response;
        })
    },
    addRestaurant: (request, response) => {
        const restaurantData = {};

        if (request.body.restaurant_name !== undefined && request.body.restaurant_name !== '' ){
            restaurantData.restaurant_name = request.body.restaurant_name
        }
        if (request.body.restaurant_latitude !== undefined && request.body.restaurant_latitude !== '' ){
            restaurantData.restaurant_latitude = request.body.restaurant_latitude
        }
        if (request.body.restaurant_longitude !== undefined && request.body.restaurant_longitude !== '' ){
            restaurantData.restaurant_longitude = request.body.restaurant_longitude
        }
        if (request.body.restaurant_longitude !== undefined && request.body.restaurant_longitude !== '' ){
            restaurantData.menu = request.body.menu
        }

        if(Object.keys(restaurantData).length === 4){
            
            restaurants.create(restaurantData)
            .then( (result) => {
            response.status(201);
            response.json({
                success: true,
                message: 'restaurant was created successfully',
                data: {
                item: restaurantData,
                },
            });
            return response;
            })

        }

    },
}


// findById: (id, res) => {
//     models.findOne({ where: { id: id } }).then(user => {
//       res(user);
//     });
//   },

module.exports = {menuController,restaurantController};