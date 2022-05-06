import React from 'react';
import { QueryClient, QueryClientProvider, useQueries, useQuery, useQueryClient } from 'react-query';

const queryClient = new QueryClient();

const useRecipe = ({ id }) => {
  return useQuery(['recipes.byId', { id }], async (): Promise<{ id: string, name: string, ratingCollectionId: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: id,
          name: 'Chicken party',
          ratingCollectionId: 'test',
        });
      }, 1000);
    });
  }, {
    refetchOnMount: false,
  });
}

const RatingComponent: React.FC<{ id: string }> = ({ id }) => {
  const { data: recipe } = useRecipe({ id });
  const [{ data: recipeRatings}, { data: recipeFavorites }] = useQueries([
    {
      queryKey: ['recipes.ratings', { ratingCollectionId: recipe?.ratingCollectionId }], 
      queryFn: async ():
        Promise<{ recipeId: string, rating: number, ratingCollectionId: string }[]> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([
              { recipeId: 'test', rating: 5, ratingCollectionId: recipe.ratingCollectionId }
            ]);
          }, 1000);
        });
      }, 
      enabled: !!recipe
    },
    {
      queryKey: ['recipes.favorites', { id }], 
      queryFn: async ():
        Promise<{ recipeId: string, favorites: number }> => {
        return new Promise((resolve, reject) => {
          console.log('trying again');
          
          if (Math.random() < 0.5) {
            reject(new Error('query failed'));
          }

          setTimeout(() => {
            resolve({
              recipeId: id,
              favorites: 20
            })
          }, 2000);
        });
      }, 
      enabled: !!recipe,
      retry: 3
    }
  ]);
  // const { data: recipeRatings } = useQuery(['recipes.ratings', { ratingCollectionId: recipe?.ratingCollectionId }], async ():
  //   Promise<{ recipeId: string, rating: number, ratingCollectionId: string }[]> => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve([
  //         { recipeId: 'test', rating: 5, ratingCollectionId: recipe.ratingCollectionId }
  //       ]);
  //     }, 1000);
  //   });
  // }, {
  //   enabled: !!recipe
  // });
  // const { data: recipeFavorites } = useQuery(['recipes.favorites', { id }], async ():
  //   Promise<{ recipeId: string, favorites: number }> => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve({
  //         recipeId: id,
  //         favorites: 20
  //       })
  //     }, 2000);
  //   });
  // }, {
  //   enabled: !!recipe
  // });
  // const queryClient = useQueryClient();


  if (!recipeRatings || !recipeFavorites) {
    return <span>loading...</span>
  }

  return <span>rating: {recipeRatings[0].rating}, favorites {recipeFavorites.favorites}</span>
};

const RecipeComponent: React.FC<{ id: string }> = ({ id }) => {
  const { data: recipe } = useRecipe({ id });

  if (!recipe) {
    return <p>loading...</p>
  }

  return <p>{recipe.name}, <RatingComponent id={id} /></p>
};

const IndexPage = () => {
  return <QueryClientProvider client={queryClient}>
    <h1>hello world</h1>
    <RecipeComponent id="test" />
  </QueryClientProvider>;
};

export default IndexPage;